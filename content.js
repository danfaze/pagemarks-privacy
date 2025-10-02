// PageWheel Content Script
// Creates and manages the 3D Rolodex overlay

(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.__PAGEWHEEL__) {
    window.__PAGEWHEEL__.toggle();
    return;
  }
  
  // State management
  const state = {
    isOpen: false,
    tabs: [],
    focusedIndex: 0,
    isRotating: false,
    settings: null,
    thumbnails: new Map(),
    abortController: null,
    rotationTimeout: null,
    captureQueue: []
  };
  
  // Logging utility
  function log(level, ...args) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevel = state.settings ? levels.indexOf(state.settings.loggingLevel) : 0;
    const msgLevel = levels.indexOf(level);
    
    if (msgLevel <= currentLevel) {
      const prefix = `[PageWheel:Content:${level.toUpperCase()}]`;
      console[level === 'debug' ? 'log' : level](prefix, ...args);
    }
  }
  
  // Send message to background with timeout
  async function sendMessage(op, payload = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Message timeout: ${op}`));
      }, timeout);
      
      chrome.runtime.sendMessage({ op, payload }, response => {
        clearTimeout(timer);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // Load settings from background
  async function loadSettings() {
    try {
      const response = await sendMessage('get-settings');
      if (response.ok) {
        state.settings = response.settings;
        log('info', 'Settings loaded');
      } else {
        log('error', 'Failed to load settings:', response.err);
        // Use defaults
        state.settings = {
          animationDuration: 160,
          degreesPerStep: 15,
          depthPerStep: 60,
          blurOnScrim: 8,
          maxVisibleCards: 8,
          showHostnames: true,
          zIndexBase: 2147483640,
          reducedMotion: false,
          cardCornerRadius: 16
        };
      }
    } catch (error) {
      log('error', 'Failed to load settings:', error);
    }
  }
  
  // Load tabs from background
  async function loadTabs() {
    try {
      const response = await sendMessage('query-tabs');
      if (response.ok) {
        state.tabs = response.tabs;
        
        // Find current tab index
        const currentTabId = await getCurrentTabId();
        const currentIndex = state.tabs.findIndex(t => t.id === currentTabId);
        if (currentIndex >= 0) {
          state.focusedIndex = currentIndex;
        }
        
        log('info', `Loaded ${state.tabs.length} tabs, focused: ${state.focusedIndex}`);
      } else {
        log('error', 'Failed to load tabs:', response.err);
        state.tabs = [];
      }
    } catch (error) {
      log('error', 'Failed to load tabs:', error);
      state.tabs = [];
    }
  }
  
  // Get current tab ID
  async function getCurrentTabId() {
    try {
      const response = await sendMessage('query-tabs');
      if (response.ok && response.tabs.length > 0) {
        // Find active tab
        const activeTab = response.tabs.find(t => t.active);
        return activeTab?.id || null;
      }
    } catch (error) {
      log('error', 'Failed to get current tab ID:', error);
    }
    return null;
  }
  
  // Capture thumbnail for a tab
  async function captureThumbnail(tabId) {
    if (state.thumbnails.has(tabId)) {
      return state.thumbnails.get(tabId);
    }
    
    try {
      const response = await sendMessage('snap-tab', { tabId }, 10000);
      if (response.ok && response.dataUrl) {
        state.thumbnails.set(tabId, response.dataUrl);
        return response.dataUrl;
      }
    } catch (error) {
      log('warn', `Failed to capture thumbnail for tab ${tabId}:`, error);
    }
    
    return null;
  }
  
  // Lazy load thumbnails for visible cards
  async function loadVisibleThumbnails() {
    const focusedTab = state.tabs[state.focusedIndex];
    if (!focusedTab) return;
    
    // Load focused card and immediate neighbors
    const indicesToLoad = [
      state.focusedIndex - 1,
      state.focusedIndex,
      state.focusedIndex + 1
    ].filter(i => i >= 0 && i < state.tabs.length);
    
    for (const index of indicesToLoad) {
      const tab = state.tabs[index];
      if (tab && !state.thumbnails.has(tab.id)) {
        log('debug', `Loading thumbnail for tab ${tab.id}`);
        captureThumbnail(tab.id).then(dataUrl => {
          if (dataUrl) {
            updateCardThumbnail(tab.id, dataUrl);
          }
        });
      }
    }
  }
  
  // Update card thumbnail in the DOM
  function updateCardThumbnail(tabId, dataUrl) {
    const shadowRoot = document.getElementById('pw-root')?.shadowRoot;
    if (!shadowRoot) return;
    
    const card = shadowRoot.querySelector(`[data-tab-id="${tabId}"]`);
    if (card) {
      const body = card.querySelector('.pw-card-body');
      if (body && dataUrl) {
        body.style.backgroundImage = `url(${dataUrl})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        log('debug', `Updated thumbnail for tab ${tabId}`);
      }
    }
  }
  
  // Create the overlay DOM structure
  function createOverlay() {
    // Create host element
    const host = document.createElement('div');
    host.id = 'pw-root';
    host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${state.settings.zIndexBase};
      pointer-events: none;
    `;
    
    // Attach shadow DOM for style isolation
    const shadow = host.attachShadow({ mode: 'open' });
    
    // Import external stylesheet
    const linkElem = document.createElement('link');
    linkElem.rel = 'stylesheet';
    linkElem.href = chrome.runtime.getURL('content.css');
    shadow.appendChild(linkElem);
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'pw-overlay';
    overlay.setAttribute('data-state', 'closed');
    
    // Scrim (background overlay)
    const scrim = document.createElement('div');
    scrim.className = 'pw-scrim';
    scrim.setAttribute('data-rotating', 'false');
    overlay.appendChild(scrim);
    
    // Stage (3D perspective container)
    const stage = document.createElement('div');
    stage.className = 'pw-stage';
    overlay.appendChild(stage);
    
    // Stack (card container)
    const stack = document.createElement('div');
    stack.className = 'pw-stack';
    stage.appendChild(stack);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'pw-close-btn';
    closeBtn.setAttribute('aria-label', 'Close PageWheel');
    closeBtn.textContent = '×';
    overlay.appendChild(closeBtn);
    
    // HUD for hints/errors
    const hud = document.createElement('div');
    hud.className = 'pw-hud';
    hud.style.display = 'none';
    overlay.appendChild(hud);
    
    shadow.appendChild(overlay);
    document.body.appendChild(host);
    
    log('info', 'Overlay DOM created');
    return { host, shadow, overlay, stack, scrim, closeBtn, hud };
  }
  
  // Create a card element
  function createCard(tab, index) {
    const card = document.createElement('div');
    card.className = 'pw-card';
    card.setAttribute('data-tab-id', tab.id);
    card.setAttribute('data-index', index);
    
    // Front face
    const front = document.createElement('div');
    front.className = 'pw-card-face pw-card-front';
    
    // Header
    const header = document.createElement('div');
    header.className = 'pw-card-header';
    
    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'pw-card-favicon';
    favicon.src = tab.favIconUrl || chrome.runtime.getURL('icons/icon16.png');
    favicon.onerror = () => {
      favicon.src = chrome.runtime.getURL('icons/icon16.png');
    };
    header.appendChild(favicon);
    
    // Title
    const title = document.createElement('div');
    title.className = 'pw-card-title';
    title.textContent = tab.title || 'Untitled';
    header.appendChild(title);
    
    // Hostname (if enabled)
    if (state.settings.showHostnames && tab.url) {
      try {
        const url = new URL(tab.url);
        const hostname = document.createElement('div');
        hostname.className = 'pw-card-hostname';
        hostname.textContent = url.hostname;
        header.appendChild(hostname);
      } catch (e) {
        // Invalid URL, skip hostname
      }
    }
    
    front.appendChild(header);
    
    // Body (thumbnail)
    const body = document.createElement('div');
    body.className = 'pw-card-body';
    
    // Placeholder until thumbnail loads
    body.style.background = 'linear-gradient(135deg, #1a3a52 0%, #0d1f2d 100%)';
    
    front.appendChild(body);
    card.appendChild(front);
    
    // Back face
    const back = document.createElement('div');
    back.className = 'pw-card-face pw-card-back';
    card.appendChild(back);
    
    return card;
  }
  
  // Render all cards
  function renderCards(stack) {
    stack.innerHTML = '';
    
    state.tabs.forEach((tab, index) => {
      const card = createCard(tab, index);
      stack.appendChild(card);
    });
    
    log('info', `Rendered ${state.tabs.length} cards`);
  }
  
  // Update card transforms and visibility
  function updateCardPositions(stack, animate = true) {
    const cards = stack.querySelectorAll('.pw-card');
    const { focusedIndex, settings } = state;
    const { degreesPerStep, depthPerStep, maxVisibleCards } = settings;
    
    cards.forEach((card, index) => {
      const delta = index - focusedIndex;
      const absDelta = Math.abs(delta);
      
      // Rotation angle (positive = forward, negative = backward)
      const rotationX = delta * degreesPerStep;
      
      // Depth offset
      const translateZ = -absDelta * depthPerStep;
      
      // Opacity curve
      const opacity = Math.max(0, 1 - absDelta * 0.16);
      
      // Z-index (focused card on top)
      const zIndex = 1000 - absDelta;
      
      // Visibility
      const isVisible = absDelta <= maxVisibleCards;
      
      // Apply transforms
      card.style.transform = `rotateX(${rotationX}deg) translateZ(${translateZ}px)`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
      card.style.display = isVisible ? 'block' : 'none';
      
      // Transition
      if (animate) {
        card.style.transition = `transform ${settings.animationDuration}ms ease-in-out, opacity ${settings.animationDuration}ms ease-in-out`;
      } else {
        card.style.transition = 'none';
      }
      
      // Collapse non-focused cards (show only header sliver)
      if (index !== focusedIndex) {
        card.classList.add('pw-card-collapsed');
      } else {
        card.classList.remove('pw-card-collapsed');
      }
      
      // Focus indicator
      if (index === focusedIndex) {
        card.classList.add('pw-card-focused');
      } else {
        card.classList.remove('pw-card-focused');
      }
    });
    
    log('debug', `Updated card positions, focused: ${focusedIndex}`);
  }
  
  // Show scrim during rotation
  function setScrimVisible(visible, scrim) {
    if (visible) {
      scrim.setAttribute('data-rotating', 'true');
      scrim.style.opacity = '1';
    } else {
      scrim.setAttribute('data-rotating', 'false');
      scrim.style.opacity = '0';
    }
  }
  
  // Rotate to a specific index
  function rotateTo(newIndex, stack, scrim) {
    if (newIndex < 0 || newIndex >= state.tabs.length) {
      log('debug', `Index ${newIndex} out of bounds`);
      return;
    }
    
    if (newIndex === state.focusedIndex) {
      log('debug', 'Already at index ' + newIndex);
      return;
    }
    
    state.focusedIndex = newIndex;
    state.isRotating = true;
    
    // Show scrim
    setScrimVisible(true, scrim);
    
    // Update positions
    updateCardPositions(stack, true);
    
    // Clear previous rotation timeout
    if (state.rotationTimeout) {
      clearTimeout(state.rotationTimeout);
    }
    
    // Hide scrim after animation + settle time
    state.rotationTimeout = setTimeout(() => {
      state.isRotating = false;
      setScrimVisible(false, scrim);
      
      // Load thumbnails for new visible cards
      loadVisibleThumbnails();
    }, state.settings.animationDuration + 120);
    
    log('debug', `Rotated to index ${newIndex}`);
  }
  
  // Navigate to previous card
  function navigatePrevious(stack, scrim) {
    const newIndex = Math.max(0, state.focusedIndex - 1);
    rotateTo(newIndex, stack, scrim);
  }
  
  // Navigate to next card
  function navigateNext(stack, scrim) {
    const newIndex = Math.min(state.tabs.length - 1, state.focusedIndex + 1);
    rotateTo(newIndex, stack, scrim);
  }
  
  // Activate focused card
  async function activateFocusedCard() {
    const focusedTab = state.tabs[state.focusedIndex];
    if (!focusedTab) {
      log('warn', 'No focused tab to activate');
      return;
    }
    
    try {
      const response = await sendMessage('focus-tab', { tabId: focusedTab.id });
      if (response.ok) {
        log('info', `Activated tab ${focusedTab.id}`);
        close();
      } else {
        log('error', 'Failed to activate tab:', response.err);
      }
    } catch (error) {
      log('error', 'Failed to activate tab:', error);
    }
  }
  
  // Show HUD message
  function showHUD(message, hud, duration = 3000) {
    hud.textContent = message;
    hud.style.display = 'block';
    hud.style.opacity = '1';
    
    setTimeout(() => {
      hud.style.opacity = '0';
      setTimeout(() => {
        hud.style.display = 'none';
      }, 200);
    }, duration);
  }
  
  // Setup event listeners
  function setupListeners(shadow, stack, scrim, closeBtn, hud) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Keyboard handler
    const handleKeyDown = (e) => {
      if (!state.isOpen) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          navigatePrevious(stack, scrim);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          navigateNext(stack, scrim);
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          activateFocusedCard();
          break;
          
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          close();
          break;
      }
    };
    
    // Mouse wheel handler
    const handleWheel = (e) => {
      if (!state.isOpen) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Normalize wheel delta
      const delta = Math.sign(e.deltaY);
      
      if (delta > 0) {
        navigateNext(stack, scrim);
      } else if (delta < 0) {
        navigatePrevious(stack, scrim);
      }
    };
    
    // Close button handler
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
    };
    
    // Attach listeners with capture phase to override page scripts
    window.addEventListener('keydown', handleKeyDown, { capture: true, signal });
    document.addEventListener('keydown', handleKeyDown, { capture: true, signal });
    window.addEventListener('wheel', handleWheel, { capture: true, passive: false, signal });
    document.addEventListener('wheel', handleWheel, { capture: true, passive: false, signal });
    
    closeBtn.addEventListener('click', handleClose, { signal });
    
    state.abortController = abortController;
    
    log('info', 'Event listeners attached');
  }
  
  // Open overlay
  async function open() {
    if (state.isOpen) {
      log('debug', 'Overlay already open');
      return;
    }
    
    log('info', 'Opening overlay');
    
    // Load settings and tabs
    await loadSettings();
    await loadTabs();
    
    if (state.tabs.length === 0) {
      log('warn', 'No eligible tabs found');
      // Could show a message to user
      return;
    }
    
    // Create overlay
    const { host, shadow, overlay, stack, scrim, closeBtn, hud } = createOverlay();
    
    // Render cards
    renderCards(stack);
    
    // Initial position without animation
    updateCardPositions(stack, false);
    
    // Setup listeners
    setupListeners(shadow, stack, scrim, closeBtn, hud);
    
    // Open overlay
    overlay.setAttribute('data-state', 'open');
    overlay.style.pointerEvents = 'auto';
    
    state.isOpen = true;
    
    // Load initial thumbnails
    setTimeout(() => {
      loadVisibleThumbnails();
    }, 100);
    
    log('info', 'Overlay opened');
  }
  
  // Close overlay
  function close() {
    if (!state.isOpen) {
      log('debug', 'Overlay already closed');
      return;
    }
    
    log('info', 'Closing overlay');
    
    // Abort listeners
    if (state.abortController) {
      state.abortController.abort();
      state.abortController = null;
    }
    
    // Clear timeouts
    if (state.rotationTimeout) {
      clearTimeout(state.rotationTimeout);
      state.rotationTimeout = null;
    }
    
    // Remove overlay
    const host = document.getElementById('pw-root');
    if (host) {
      host.remove();
    }
    
    state.isOpen = false;
    state.isRotating = false;
    
    log('info', 'Overlay closed');
  }
  
  // Toggle overlay
  function toggle() {
    if (state.isOpen) {
      close();
    } else {
      open();
    }
  }
  
  // Export API
  window.__PAGEWHEEL__ = {
    toggle,
    open,
    close,
    state
  };
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      toggle();
      sendResponse({ ok: true });
    }
    return true;
  });
  
  log('info', 'PageWheel content script loaded');
  
  // Auto-toggle on first load if this is from a command
  // (The background will inject and send toggle message)
})();

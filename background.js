// PageWheel Background Service Worker
// Handles tab management, commands, messaging, and tiling

// Default settings
const DEFAULT_SETTINGS = {
  // Wheel / Motion
  animationDuration: 160,
  degreesPerStep: 15,
  depthPerStep: 60,
  blurOnScrim: 8,
  maxVisibleCards: 8,
  showHostnames: true,
  sensitivityCurve: 'linear',
  reducedMotion: false,
  
  // Marks & Tiling
  maxMarkedTabs: 4,
  tilingGap: 10,
  tilingMonitor: 'current',
  raiseFirstWindow: true,
  
  // Security
  allowFile: false,
  allowData: false,
  restrictInternalSchemes: true,
  allowClipboard: false,
  
  // Privacy & Crash-safety
  loggingLevel: 'error',
  noThumbnails: false,
  
  // Style
  theme: 'dark',
  accentHue: 180,
  accentSaturation: 70,
  cardCornerRadius: 16,
  elevationScale: 1.0,
  
  // Power user
  zIndexBase: 2147483640,
  perSiteEnabled: {},
  snapshotThrottle: 100,
  alternativeLayout: false
};

// Cached settings
let cachedSettings = { ...DEFAULT_SETTINGS };

// Marked tabs storage
let markedTabs = [];

// Logging utility
function log(level, ...args) {
  const levels = ['error', 'warn', 'info', 'debug'];
  const currentLevel = levels.indexOf(cachedSettings.loggingLevel);
  const msgLevel = levels.indexOf(level);
  
  if (msgLevel <= currentLevel) {
    const prefix = `[PageWheel:${level.toUpperCase()}]`;
    console[level === 'debug' ? 'log' : level](prefix, ...args);
  }
}

// Initialize settings on install/startup
async function initializeSettings() {
  try {
    const stored = await chrome.storage.sync.get('settings');
    if (stored.settings) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...stored.settings };
      log('info', 'Settings loaded from storage');
    } else {
      await chrome.storage.sync.set({ settings: cachedSettings });
      log('info', 'Default settings initialized');
    }
    
    // Load marked tabs from local storage
    const markedData = await chrome.storage.local.get('markedTabs');
    markedTabs = markedData.markedTabs || [];
    log('info', `Loaded ${markedTabs.length} marked tabs`);
  } catch (error) {
    log('error', 'Failed to initialize settings:', error);
  }
}

// Check if a URL is eligible based on security settings
function isUrlEligible(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    
    // Always deny internal browser schemes if restricted
    if (cachedSettings.restrictInternalSchemes) {
      if (protocol === 'chrome:' || protocol === 'edge:' || 
          protocol === 'chrome-extension:' || protocol === 'about:') {
        return false;
      }
    }
    
    // Check file: protocol
    if (protocol === 'file:' && !cachedSettings.allowFile) {
      return false;
    }
    
    // Check data: protocol
    if (protocol === 'data:' && !cachedSettings.allowData) {
      return false;
    }
    
    // Allow http and https
    if (protocol === 'http:' || protocol === 'https:') {
      return true;
    }
    
    return false;
  } catch (error) {
    log('warn', 'Invalid URL:', url, error);
    return false;
  }
}

// Get all eligible tabs
async function getEligibleTabs() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const eligible = tabs.filter(tab => isUrlEligible(tab.url));
    log('debug', `Found ${eligible.length} eligible tabs out of ${tabs.length}`);
    return eligible;
  } catch (error) {
    log('error', 'Failed to query tabs:', error);
    return [];
  }
}

// Capture tab thumbnail with safe focus restoration
async function captureTabThumbnail(tabId) {
  let originalActiveTab = null;
  let originalWindow = null;
  
  try {
    // Get current active tab and window
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    originalActiveTab = currentTab;
    originalWindow = currentTab?.windowId;
    
    // Get target tab
    const targetTab = await chrome.tabs.get(tabId);
    
    // Focus the target tab's window first
    if (targetTab.windowId !== originalWindow) {
      await chrome.windows.update(targetTab.windowId, { focused: true });
    }
    
    // Activate the target tab
    await chrome.tabs.update(tabId, { active: true });
    
    // Small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capture the visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(targetTab.windowId, {
      format: 'png',
      quality: 90
    });
    
    log('debug', `Captured thumbnail for tab ${tabId}`);
    
    return dataUrl;
  } catch (error) {
    log('warn', `Failed to capture thumbnail for tab ${tabId}:`, error);
    return null;
  } finally {
    // Always restore original focus
    try {
      if (originalWindow && originalActiveTab) {
        await chrome.windows.update(originalWindow, { focused: true });
        await chrome.tabs.update(originalActiveTab.id, { active: true });
      }
    } catch (restoreError) {
      log('warn', 'Failed to restore original tab focus:', restoreError);
    }
  }
}

// Focus a specific tab
async function focusTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });
    log('info', `Focused tab ${tabId}`);
    return { ok: true };
  } catch (error) {
    log('error', `Failed to focus tab ${tabId}:`, error);
    return { ok: false, err: error.message };
  }
}

// Toggle marked status for a tab
async function toggleMarkTab(tabId) {
  try {
    const index = markedTabs.indexOf(tabId);
    
    if (index >= 0) {
      // Unmark
      markedTabs.splice(index, 1);
      log('info', `Unmarked tab ${tabId}`);
    } else {
      // Mark
      markedTabs.push(tabId);
      
      // Trim to max if needed
      if (markedTabs.length > cachedSettings.maxMarkedTabs) {
        markedTabs = markedTabs.slice(-cachedSettings.maxMarkedTabs);
        log('info', `Trimmed marked tabs to ${cachedSettings.maxMarkedTabs}`);
      }
      
      log('info', `Marked tab ${tabId}`);
    }
    
    // Save to storage
    await chrome.storage.local.set({ markedTabs });
    
    return { ok: true, marked: markedTabs };
  } catch (error) {
    log('error', `Failed to toggle mark for tab ${tabId}:`, error);
    return { ok: false, err: error.message };
  }
}

// Tile windows (2 or 4 marked tabs)
async function tileWindows(count) {
  try {
    if (count !== 2 && count !== 4) {
      return { ok: false, err: 'Count must be 2 or 4' };
    }
    
    // Get the most recent marked tabs
    const tabsToTile = markedTabs.slice(-count);
    
    if (tabsToTile.length < count) {
      return { ok: false, err: `Need ${count} marked tabs, only have ${tabsToTile.length}` };
    }
    
    // Get screen dimensions
    const currentWindow = await chrome.windows.getCurrent();
    const displays = await chrome.system?.display?.getInfo?.() || null;
    
    // Fallback to current window dimensions if display API not available
    const screenWidth = displays?.[0]?.bounds?.width || 1920;
    const screenHeight = displays?.[0]?.bounds?.height || 1080;
    const gap = cachedSettings.tilingGap;
    
    // Calculate tile dimensions
    let layouts;
    if (count === 2) {
      const width = Math.floor((screenWidth - gap * 3) / 2);
      const height = screenHeight - gap * 2;
      layouts = [
        { left: gap, top: gap, width, height },
        { left: gap * 2 + width, top: gap, width, height }
      ];
    } else { // count === 4
      const width = Math.floor((screenWidth - gap * 3) / 2);
      const height = Math.floor((screenHeight - gap * 3) / 2);
      layouts = [
        { left: gap, top: gap, width, height },
        { left: gap * 2 + width, top: gap, width, height },
        { left: gap, top: gap * 2 + height, width, height },
        { left: gap * 2 + width, top: gap * 2 + height, width, height }
      ];
    }
    
    // Create or move windows
    const windowIds = [];
    for (let i = 0; i < count; i++) {
      const tabId = tabsToTile[i];
      const layout = layouts[i];
      
      try {
        // Create new window with the tab
        const newWindow = await chrome.windows.create({
          tabId: tabId,
          focused: i === 0 && cachedSettings.raiseFirstWindow,
          state: 'normal',
          ...layout
        });
        
        windowIds.push(newWindow.id);
        log('info', `Tiled tab ${tabId} to position ${i + 1}`);
      } catch (error) {
        log('warn', `Failed to tile tab ${tabId}:`, error);
      }
    }
    
    // Focus first window if requested
    if (cachedSettings.raiseFirstWindow && windowIds.length > 0) {
      await chrome.windows.update(windowIds[0], { focused: true });
    }
    
    return { ok: true, windows: windowIds };
  } catch (error) {
    log('error', `Failed to tile ${count} windows:`, error);
    return { ok: false, err: error.message };
  }
}

// Message bus handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { op, payload } = message;
  
  log('debug', `Received message: ${op}`, payload);
  
  // Handle async operations
  (async () => {
    try {
      let response;
      
      switch (op) {
        case 'get-settings':
          response = { ok: true, settings: cachedSettings };
          break;
          
        case 'save-settings':
          if (!payload || typeof payload !== 'object') {
            response = { ok: false, err: 'Invalid settings payload' };
          } else {
            cachedSettings = { ...DEFAULT_SETTINGS, ...payload };
            await chrome.storage.sync.set({ settings: cachedSettings });
            response = { ok: true, settings: cachedSettings };
            log('info', 'Settings saved');
          }
          break;
          
        case 'query-tabs':
          const tabs = await getEligibleTabs();
          response = { ok: true, tabs };
          break;
          
        case 'focus-tab':
          if (!payload || typeof payload.tabId !== 'number') {
            response = { ok: false, err: 'Invalid tabId' };
          } else {
            response = await focusTab(payload.tabId);
          }
          break;
          
        case 'snap-tab':
          if (!payload || typeof payload.tabId !== 'number') {
            response = { ok: false, err: 'Invalid tabId' };
          } else {
            const dataUrl = await captureTabThumbnail(payload.tabId);
            response = { ok: true, dataUrl };
          }
          break;
          
        case 'toggle-mark':
          if (!payload || typeof payload.tabId !== 'number') {
            response = { ok: false, err: 'Invalid tabId' };
          } else {
            response = await toggleMarkTab(payload.tabId);
          }
          break;
          
        case 'get-marked':
          response = { ok: true, marked: markedTabs };
          break;
          
        case 'tile':
          if (!payload || typeof payload.count !== 'number') {
            response = { ok: false, err: 'Invalid count' };
          } else {
            response = await tileWindows(payload.count);
          }
          break;
          
        default:
          response = { ok: false, err: `Unknown op: ${op}` };
          log('warn', `Unknown operation: ${op}`);
      }
      
      sendResponse(response);
    } catch (error) {
      log('error', `Error handling ${op}:`, error);
      sendResponse({ ok: false, err: error.message });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

// Command handlers
chrome.commands.onCommand.addListener(async (command) => {
  log('info', `Command triggered: ${command}`);
  
  try {
    switch (command) {
      case 'toggle-overlay':
        // Inject and toggle overlay in the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !isUrlEligible(tab.url)) {
          log('warn', 'Cannot toggle overlay on this page');
          return;
        }
        
        // Inject content script if needed
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Inject CSS
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        });
        
        // Send toggle message
        await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
        break;
        
      case 'mark-tab':
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab) {
          await toggleMarkTab(currentTab.id);
        }
        break;
        
      case 'tile-2':
        await tileWindows(2);
        break;
        
      case 'tile-4':
        await tileWindows(4);
        break;
        
      default:
        log('warn', `Unknown command: ${command}`);
    }
  } catch (error) {
    log('error', `Error handling command ${command}:`, error);
  }
});

// Context menu items
chrome.runtime.onInstalled.addListener(() => {
  log('info', 'PageWheel installed');
  
  // Create context menus
  chrome.contextMenus.create({
    id: 'pagewheel-toggle',
    title: 'Toggle PageWheel',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'pagewheel-mark',
    title: 'Mark/Unmark Tab',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'pagewheel-tile-2',
    title: 'Tile 2 Marked Tabs',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'pagewheel-tile-4',
    title: 'Tile 4 Marked Tabs',
    contexts: ['page']
  });
  
  // Initialize settings
  initializeSettings();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  log('info', `Context menu clicked: ${info.menuItemId}`);
  
  switch (info.menuItemId) {
    case 'pagewheel-toggle':
      chrome.commands.onCommand.trigger?.('toggle-overlay') || 
        chrome.runtime.sendMessage({ action: 'execute-command', command: 'toggle-overlay' });
      break;
      
    case 'pagewheel-mark':
      if (tab) {
        toggleMarkTab(tab.id);
      }
      break;
      
    case 'pagewheel-tile-2':
      tileWindows(2);
      break;
      
    case 'pagewheel-tile-4':
      tileWindows(4);
      break;
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  log('info', 'PageWheel service worker started');
  initializeSettings();
});

// Keep service worker alive with periodic tasks
setInterval(() => {
  // Periodic health check
  log('debug', 'Service worker heartbeat');
}, 25000);

log('info', 'PageWheel background service worker loaded');

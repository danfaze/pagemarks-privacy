// PageWheel Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const markBtn = document.getElementById('mark-btn');
  
  // Toggle PageWheel overlay
  toggleBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        console.error('No active tab found');
        return;
      }
      
      // Inject content script if needed
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        });
      } catch (err) {
        // Script might already be injected
        console.log('Script injection skipped:', err.message);
      }
      
      // Send toggle message
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      
      // Close popup
      window.close();
    } catch (error) {
      console.error('Failed to toggle PageWheel:', error);
      
      // Show error to user
      toggleBtn.textContent = '❌ Error - Try again';
      setTimeout(() => {
        toggleBtn.innerHTML = '<span class="btn-icon">⚡</span>Open PageWheel';
      }, 2000);
    }
  });
  
  // Open settings
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
  
  // Mark current tab
  markBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        console.error('No active tab found');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        op: 'toggle-mark',
        payload: { tabId: tab.id }
      });
      
      if (response.ok) {
        markBtn.textContent = '✓ Marked!';
        setTimeout(() => {
          markBtn.textContent = '⭐ Mark Tab';
        }, 1500);
      } else {
        console.error('Failed to mark tab:', response.err);
        markBtn.textContent = '❌ Error';
        setTimeout(() => {
          markBtn.textContent = '⭐ Mark Tab';
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to mark tab:', error);
    }
  });
  
  // Update keyboard shortcut display based on OS
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  if (isMac) {
    document.querySelectorAll('kbd').forEach(kbd => {
      kbd.textContent = kbd.textContent.replace('Ctrl', '⌘');
    });
  }
});

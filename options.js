// PageWheel Options Script

// Default settings (must match background.js)
const DEFAULT_SETTINGS = {
  animationDuration: 160,
  degreesPerStep: 15,
  depthPerStep: 60,
  blurOnScrim: 8,
  maxVisibleCards: 8,
  showHostnames: true,
  sensitivityCurve: 'linear',
  reducedMotion: false,
  maxMarkedTabs: 4,
  tilingGap: 10,
  tilingMonitor: 'current',
  raiseFirstWindow: true,
  allowFile: false,
  allowData: false,
  restrictInternalSchemes: true,
  allowClipboard: false,
  loggingLevel: 'error',
  noThumbnails: false,
  theme: 'dark',
  accentHue: 180,
  accentSaturation: 70,
  cardCornerRadius: 16,
  elevationScale: 1.0,
  zIndexBase: 2147483640,
  perSiteEnabled: {},
  snapshotThrottle: 100,
  alternativeLayout: false
};

let currentSettings = { ...DEFAULT_SETTINGS };

// Load settings from storage
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ op: 'get-settings' });
    
    if (response && response.ok) {
      currentSettings = response.settings;
      console.log('Settings loaded:', currentSettings);
    } else {
      console.warn('Failed to load settings, using defaults');
      currentSettings = { ...DEFAULT_SETTINGS };
    }
    
    populateForm();
  } catch (error) {
    console.error('Error loading settings:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
    populateForm();
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    const response = await chrome.runtime.sendMessage({
      op: 'save-settings',
      payload: currentSettings
    });
    
    if (response && response.ok) {
      console.log('Settings saved successfully');
      showToast('Settings saved!');
      return true;
    } else {
      console.error('Failed to save settings:', response?.err);
      showToast('Error saving settings', 'error');
      return false;
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Error saving settings', 'error');
    return false;
  }
}

// Populate form with current settings
function populateForm() {
  // Range inputs
  const rangeInputs = [
    'animationDuration',
    'degreesPerStep',
    'depthPerStep',
    'blurOnScrim',
    'maxVisibleCards',
    'maxMarkedTabs',
    'tilingGap',
    'accentHue',
    'accentSaturation',
    'cardCornerRadius',
    'snapshotThrottle'
  ];
  
  rangeInputs.forEach(id => {
    const input = document.getElementById(id);
    const valueSpan = document.getElementById(id + '-value');
    
    if (input && currentSettings[id] !== undefined) {
      input.value = currentSettings[id];
      updateValueDisplay(input, valueSpan);
    }
  });
  
  // Checkboxes
  const checkboxes = [
    'showHostnames',
    'reducedMotion',
    'raiseFirstWindow',
    'allowFile',
    'allowData',
    'restrictInternalSchemes',
    'noThumbnails',
    'alternativeLayout'
  ];
  
  checkboxes.forEach(id => {
    const input = document.getElementById(id);
    
    if (input && currentSettings[id] !== undefined) {
      input.checked = currentSettings[id];
    }
  });
  
  // Select inputs
  const selects = ['loggingLevel', 'theme'];
  
  selects.forEach(id => {
    const input = document.getElementById(id);
    
    if (input && currentSettings[id] !== undefined) {
      input.value = currentSettings[id];
    }
  });
  
  // Number input
  const zIndexInput = document.getElementById('zIndexBase');
  if (zIndexInput && currentSettings.zIndexBase !== undefined) {
    zIndexInput.value = currentSettings.zIndexBase;
  }
}

// Update value display for range inputs
function updateValueDisplay(input, valueSpan) {
  if (!valueSpan) return;
  
  const id = input.id;
  const value = input.value;
  let displayValue = value;
  
  // Add units based on setting type
  if (id.includes('Duration') || id.includes('Throttle')) {
    displayValue = value + 'ms';
  } else if (id.includes('Degrees') || id.includes('Hue')) {
    displayValue = value + '°';
  } else if (id.includes('depth') || id.includes('Gap') || id.includes('blur') || id.includes('Radius')) {
    displayValue = value + 'px';
  } else if (id.includes('Saturation')) {
    displayValue = value + '%';
  }
  
  valueSpan.textContent = displayValue;
}

// Setup event listeners
function setupListeners() {
  // Range inputs with live update
  const rangeInputs = document.querySelectorAll('input[type="range"]');
  
  rangeInputs.forEach(input => {
    const valueSpan = document.getElementById(input.id + '-value');
    
    input.addEventListener('input', () => {
      updateValueDisplay(input, valueSpan);
    });
    
    input.addEventListener('change', () => {
      const key = input.id;
      currentSettings[key] = parseFloat(input.value);
      saveSettings();
    });
  });
  
  // Checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(input => {
    input.addEventListener('change', () => {
      const key = input.id;
      currentSettings[key] = input.checked;
      saveSettings();
    });
  });
  
  // Select inputs
  const selects = document.querySelectorAll('select');
  
  selects.forEach(input => {
    input.addEventListener('change', () => {
      const key = input.id;
      currentSettings[key] = input.value;
      saveSettings();
    });
  });
  
  // Number input
  const zIndexInput = document.getElementById('zIndexBase');
  if (zIndexInput) {
    zIndexInput.addEventListener('change', () => {
      currentSettings.zIndexBase = parseInt(zIndexInput.value, 10);
      saveSettings();
    });
  }
  
  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all settings to defaults? This cannot be undone.')) {
        currentSettings = { ...DEFAULT_SETTINGS };
        populateForm();
        saveSettings();
        showToast('Settings reset to defaults');
      }
    });
  }
  
  // Save button (already auto-saves, but provides feedback)
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveSettings();
    });
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = 'toast toast-' + type + ' toast-visible';
  
  setTimeout(() => {
    toast.classList.remove('toast-visible');
  }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('PageWheel Options loaded');
  loadSettings();
  setupListeners();
});

# PageWheel - Quick Start Guide

## Installation (5 minutes)

### Option 1: Load from Source
1. **Download the code**:
   ```bash
   git clone https://github.com/danfaze/pagemarks-privacy
   cd pagemarks-privacy
   ```

2. **Install dependencies** (only needed for icons):
   ```bash
   pip install Pillow
   python3 generate-icons.py
   ```

3. **Build the extension**:
   ```bash
   npm install
   npm run build
   ```

4. **Load in Chrome**:
   - Open Chrome
   - Go to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder
   - Done! PageWheel icon should appear in toolbar

### Option 2: Pre-built Package (when available)
1. Download `pagewheel.zip` from releases
2. Unzip the file
3. Load in Chrome as above (step 4)

## First Use (2 minutes)

### 1. Open Some Tabs
- Open 3-5 different websites in new tabs
- Any normal http:// or https:// pages work

### 2. Toggle the Overlay
**Windows/Linux**: Press `Ctrl+Shift+W`  
**Mac**: Press `⌘+Shift+W`

You should see the 3D Rolodex appear!

### 3. Navigate
- Press **↑** or **↓** to flip between cards
- Or use your **mouse wheel**
- Watch the smooth 3D rotation

### 4. Switch Tabs
- Find a tab you want to open
- Press **Enter** or **Space**
- The overlay closes and you're on that tab!

### 5. Close Without Switching
- Press **Esc** to close the overlay
- You stay on your current tab

## Try Advanced Features (5 minutes)

### Mark Tabs
1. Go to an interesting tab
2. Press `Ctrl+Shift+M` (Mac: `⌘+Shift+M`)
3. Tab is now marked!
4. Mark 2-3 more tabs

### Tile Windows
1. Right-click on any page
2. Select **"Tile 2 Marked Tabs"** or **"Tile 4 Marked Tabs"**
3. Windows arrange automatically side-by-side!

### Customize Settings
1. Click the PageWheel icon in toolbar
2. Click **"⚙️ Settings"**
3. Try adjusting:
   - Animation speed
   - Rotation angle
   - Visual style
4. Changes apply immediately!

## Keyboard Reference

| Action | Shortcut (Win/Linux) | Shortcut (Mac) |
|--------|---------------------|----------------|
| Toggle overlay | Ctrl+Shift+W | ⌘+Shift+W |
| Mark tab | Ctrl+Shift+M | ⌘+Shift+M |
| Previous card | ↑ | ↑ |
| Next card | ↓ | ↓ |
| Activate card | Enter or Space | Enter or Space |
| Close overlay | Esc | Esc |

## Troubleshooting

### "Extension not loading"
- Make sure you're using Chrome (not Edge, Firefox, etc.)
- Chrome version must be 88+ (check `chrome://version`)
- Try restarting Chrome

### "Overlay won't open"
- You might be on a restricted page (chrome://, edge://)
- Try on a normal website like google.com
- Check the extension is enabled at `chrome://extensions`

### "Keys don't work"
- Another extension might use the same shortcut
- Change shortcuts at `chrome://extensions/shortcuts`
- In-overlay keys (↑/↓/Enter/Esc) always work

### "No thumbnails showing"
- First load takes a moment
- Some sites block capture (fallback to favicon)
- Enable "No Thumbnails Mode" in settings if preferred

## What's Next?

- Read the full [README.md](README.md) for detailed features
- Check [USAGE.md](USAGE.md) for comprehensive guide
- Explore [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details
- Report issues at https://github.com/danfaze/pagemarks-privacy/issues

## Need Help?

- Email: support@fusiontechnology.com
- GitHub Issues: https://github.com/danfaze/pagemarks-privacy/issues
- Read the troubleshooting section above

---

**That's it!** You're ready to use PageWheel. Press `Ctrl+Shift+W` anytime to flip through your tabs in style! 🎡

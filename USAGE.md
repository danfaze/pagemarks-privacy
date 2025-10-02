# PageWheel Usage Guide

## Quick Start

### Installation
1. Download the extension or build from source
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `dist` folder
5. The PageWheel icon should appear in your toolbar

### First Use
1. Open a few tabs in Chrome
2. Click the PageWheel icon in the toolbar OR press `Ctrl+Shift+W` (Mac: `⌘+Shift+W`)
3. The 3D Rolodex overlay will appear

## Controls

### Overlay Navigation
- **↑ (Up Arrow)**: Go to previous card
- **↓ (Down Arrow)**: Go to next card
- **Mouse Wheel Up**: Go to previous card
- **Mouse Wheel Down**: Go to next card

### Actions
- **Enter** or **Space**: Switch to the focused tab and close overlay
- **Esc**: Close overlay without switching tabs
- **× Button**: Click to close overlay

### Global Shortcuts
- **Ctrl+Shift+W** (Mac: `⌘+Shift+W`): Toggle PageWheel overlay
- **Ctrl+Shift+M** (Mac: `⌘+Shift+M`): Mark/unmark current tab

## Features

### 3D Card Viewing
- The front card shows a live thumbnail of the tab
- Behind it, you'll see header "slivers" of other tabs
- Cards flip smoothly with realistic 3D rotation
- The blue scrim (background blur) appears only while rotating

### Tab Marking
1. Press `Ctrl+Shift+M` while on a tab to mark it
2. Press again to unmark
3. Marked tabs are saved and persist across sessions
4. Maximum marked tabs is configurable (default: 4)

### Window Tiling
1. Mark 2 or 4 tabs using `Ctrl+Shift+M`
2. Right-click on any page and select:
   - "Tile 2 Marked Tabs" - Creates two side-by-side windows
   - "Tile 4 Marked Tabs" - Creates four windows in quad layout
3. Windows are automatically positioned with configurable gaps

## Settings

### Accessing Settings
- Click PageWheel icon → "⚙️ Settings" button
- Or right-click the extension icon → "Options"
- Or go to `chrome://extensions` → PageWheel → "Details" → "Extension options"

### Key Settings Explained

#### Wheel & Motion
- **Animation Duration**: How long card flips take (100-300ms)
- **Rotation Degrees**: Angle between cards (10-20°)
- **Depth Per Step**: 3D spacing between cards (30-100px)
- **Scrim Blur**: Background blur during rotation (0-12px)
- **Max Visible Cards**: How many cards to render (4-12)
- **Show Hostnames**: Display website domains on cards
- **Reduced Motion**: Shorter animations for accessibility

#### Marks & Tiling
- **Max Marked Tabs**: Maximum tabs that can be marked (2-8)
- **Tiling Gap**: Space between tiled windows (0-50px)
- **Raise First Window**: Auto-focus first window after tiling

#### Security
- **Allow file:// URLs**: Enable overlay on local files
- **Allow data:// URLs**: Enable overlay on data URLs
- **Restrict Internal Schemes**: Block chrome://, edge://, extension pages (recommended)

#### Privacy & Crash-safety
- **Logging Level**: Console verbosity (error/warn/info/debug)
- **No Thumbnails Mode**: Show only favicons and titles (faster, more private)

#### Style
- **Theme**: Dark or Light (light coming soon)
- **Accent Hue**: Color tint for accents (0-360°)
- **Accent Saturation**: Color intensity (0-100%)
- **Card Corner Radius**: Roundness of cards (4-32px)

#### Power User
- **Z-Index Base**: Overlay stacking level (for compatibility)
- **Snapshot Throttle**: Time between thumbnail captures (50-500ms)
- **Alternative Layout**: Use simple list instead of 3D (for low-end devices)

## Tips & Tricks

### Performance
- If thumbnails load slowly, increase "Snapshot Throttle" in settings
- Enable "No Thumbnails Mode" for instant loading
- Use "Alternative Layout" on older/slower computers
- Reduce "Max Visible Cards" if you experience lag

### Keyboard Efficiency
1. Press `Ctrl+Shift+W` to open overlay
2. Use ↑/↓ to find your tab
3. Press Enter to switch
4. Total time: 1-2 seconds (faster than Alt+Tab for many tabs!)

### Marking Workflow
1. While researching, mark tabs you want to reference
2. When ready, tile them all side-by-side
3. Compare information across windows
4. Unmark when done or mark new tabs

### Privacy
- All data stays local in your browser
- No internet connection required
- No tracking, analytics, or external servers
- Settings sync across devices via Chrome (if enabled)

## Troubleshooting

### Overlay Won't Open
**Problem**: Nothing happens when pressing Ctrl+Shift+W

**Solutions**:
1. Check you're not on a restricted page (chrome://, edge://, new tab)
2. Verify extension is enabled at `chrome://extensions`
3. Try reloading the page (Ctrl+R)
4. Check console for errors (F12 → Console tab)
5. Enable file:// and data:// URLs in settings if needed

### Keyboard Shortcuts Don't Work
**Problem**: Ctrl+Shift+W opens something else

**Solutions**:
1. Go to `chrome://extensions/shortcuts`
2. Find PageWheel shortcuts
3. Change to different key combination
4. Make sure no other extension uses the same shortcut

### Thumbnails Not Loading
**Problem**: Cards show only favicons, no previews

**Solutions**:
1. PageWheel needs permission to capture tabs
2. Some sites block capture for security
3. Try reloading tabs
4. Enable "No Thumbnails Mode" if you prefer (Settings → Privacy)
5. Increase "Snapshot Throttle" if captures are too fast

### Overlay Appears Behind Page Content
**Problem**: Page content overlays the Rolodex

**Solutions**:
1. Go to Settings → Power User
2. Increase "Z-Index Base" (try 2147483640)
3. Report the specific site (may need site-specific fix)

### Cards Look Wrong / Glitchy
**Problem**: 3D rotation looks broken

**Solutions**:
1. Update Chrome to latest version
2. Enable hardware acceleration (Settings → System → Use hardware acceleration)
3. Try "Alternative Layout" mode in settings
4. Enable "Reduced Motion" in settings

### Tiling Doesn't Work
**Problem**: Tile commands do nothing

**Solutions**:
1. Mark at least 2 tabs (for 2-up) or 4 tabs (for 4-up)
2. Right-click and verify marked tabs
3. Check you have permission to move tabs
4. Ensure sufficient screen space
5. Try marking different tabs

### Extension Crashes or Freezes
**Problem**: PageWheel stops responding

**Solutions**:
1. Close overlay (press Esc repeatedly)
2. Reload extension at `chrome://extensions`
3. Check console for errors
4. Reduce "Max Visible Cards" in settings
5. Enable "Reduced Motion" mode
6. Report issue with error details

## Accessibility

### Keyboard-Only Navigation
- All features accessible via keyboard
- No mouse required
- Logical tab order in settings
- Esc always closes overlay

### Screen Readers
- ARIA labels on interactive elements
- Semantic HTML structure
- Close button has aria-label
- Consider "No Thumbnails Mode" for simpler UI

### Motion Sensitivity
- Enable "Reduced Motion" in settings
- Or: System → Settings → Accessibility → Reduce motion
- PageWheel respects OS motion preferences
- Alternative Layout mode available

### Visual Accessibility
- High contrast mode supported
- Sufficient color contrast ratios
- Focus indicators on all interactive elements
- Keyboard shortcuts visible in UI

## Advanced Usage

### Multiple Windows
- PageWheel shows tabs from the current window only
- Open overlay in different windows to switch between their tabs
- Use tiling to compare tabs across windows

### Large Tab Counts
- With 50+ tabs, only first N are loaded (configurable)
- Thumbnails load lazily (only visible cards)
- Performance remains smooth with proper settings

### Custom Shortcuts
1. Go to `chrome://extensions/shortcuts`
2. Find PageWheel commands
3. Click pencil icon to edit
4. Press your preferred key combination
5. Click OK to save

### Per-Site Settings (Coming Soon)
- Enable/disable PageWheel on specific sites
- Custom settings per domain
- Whitelist/blacklist functionality

## Uninstalling

1. Go to `chrome://extensions`
2. Find PageWheel
3. Click "Remove"
4. Confirm deletion

Note: All settings and marked tabs are stored locally and will be deleted.

## Getting Help

- Check this guide first
- Visit GitHub Issues: [github.com/danfaze/pagemarks-privacy/issues](https://github.com/danfaze/pagemarks-privacy/issues)
- Email: support@fusiontechnology.com
- Include Chrome version, OS, and error messages if reporting a bug

## Privacy & Data

### What's Stored
- Settings (chrome.storage.sync)
- Marked tab IDs (chrome.storage.local)
- No browsing history
- No personal data

### What's Not Stored
- Tab content (only captured temporarily for thumbnails)
- Passwords or form data
- Cookies or tracking data

### Data Location
- Everything stays in your browser
- Settings sync via Chrome if enabled
- No external servers
- No analytics or tracking

## Tips for Developers

### Loading Unpacked Extension
```bash
git clone https://github.com/danfaze/pagemarks-privacy
cd pagemarks-privacy
npm install
python3 generate-icons.py
npm run build
```
Then load `dist/` folder in Chrome.

### Making Changes
1. Edit source files (not files in `dist/`)
2. Run `npm run build`
3. Go to `chrome://extensions`
4. Click reload icon on PageWheel card
5. Test changes

### Debugging
- Background: `chrome://extensions` → PageWheel → "service worker" link
- Content: Right-click page → Inspect → Console
- Enable debug logging in settings
- Check `chrome://extensions` for errors

## Keyboard Reference

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Toggle Overlay | Ctrl+Shift+W | ⌘+Shift+W |
| Mark Tab | Ctrl+Shift+M | ⌘+Shift+M |
| Previous Card | ↑ | ↑ |
| Next Card | ↓ | ↓ |
| Activate Card | Enter or Space | Enter or Space |
| Close Overlay | Esc | Esc |

## What's Next?

Check the [CHANGELOG.md](CHANGELOG.md) for updates and new features!

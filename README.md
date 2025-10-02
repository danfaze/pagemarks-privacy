# PageWheel

A polished, production-grade Chrome MV3 extension that turns tabs into a face-on vertical Rolodex with smooth 3D flipping.

![PageWheel](icons/icon128.png)

## Features

### 🎡 3D Vertical Rolodex
- Face-on orientation with vertical rotation around a horizontal axle
- Smooth 3D card flipping with GPU-accelerated transforms
- Live tab previews with thumbnails, favicons, and titles
- Stacked cards showing header slivers with depth and fading
- Blue transparent scrim visible only during rotation

### ⌨️ Instant Keyboard Control
- **↑/↓**: Navigate previous/next card
- **Enter/Space**: Activate focused card and switch tabs
- **Esc**: Close overlay without switching tabs
- **Ctrl+Shift+W** (⌘+Shift+W on Mac): Toggle overlay
- **Mouse wheel**: Flip through cards

### ⭐ Tab Marking & Tiling
- Mark/unmark tabs with **Ctrl+Shift+M** (⌘+Shift+M on Mac)
- Tile 2 or 4 marked tabs in neat side-by-side layouts
- Configurable gaps and monitor selection

### 🔒 Security & Privacy
- Principle of least privilege with only necessary permissions
- Configurable protocol filtering (blocks chrome://, edge:// by default)
- Optional support for file:// and data:// URLs
- No data collection, no analytics, no remote servers
- All data stays local in your browser

### ⚙️ Advanced Settings
- **Wheel/Motion**: Animation duration, rotation degrees, depth, blur, visibility
- **Marks & Tiling**: Max marked tabs, tiling gaps, window behavior
- **Security**: Protocol restrictions, clipboard controls
- **Privacy**: Logging levels (local only), no-thumbnails mode
- **Style**: Themes, accent colors, corner radius customization
- **Power User**: Z-index control, snapshot throttling, alternative layouts

### ♿ Accessibility
- Full keyboard navigation
- Respects `prefers-reduced-motion`
- ARIA labels and semantic HTML
- High contrast mode support
- Focus indicators throughout

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm permissions

### Manual Installation (Development)
1. Clone this repository or download the source code
2. Run `npm install` and `npm run build` to generate icons and prepare files
3. Open Chrome and navigate to `chrome://extensions`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked"
6. Select the `dist` directory from the project folder

## Building from Source

```bash
# Install dependencies
npm install

# Generate icons
python3 generate-icons.py

# Build the extension
npm run build

# Create distribution ZIP
npm run zip
```

The built extension will be in the `dist` directory, and a `pagewheel.zip` file will be created for distribution.

## Usage

1. **Open the overlay**: Click the PageWheel icon or press `Ctrl+Shift+W` (⌘+Shift+W on Mac)
2. **Navigate**: Use arrow keys or mouse wheel to flip through your tabs
3. **Switch tabs**: Press Enter or Space on the focused card
4. **Close**: Press Esc or click the × button
5. **Mark tabs**: Press `Ctrl+Shift+M` (⌘+Shift+M) to mark the current tab
6. **Tile tabs**: Use commands or context menu to tile 2 or 4 marked tabs

## Keyboard Shortcuts

You can customize shortcuts at `chrome://extensions/shortcuts`:

- **Toggle PageWheel**: `Ctrl+Shift+W` (⌘+Shift+W on Mac)
- **Mark/Unmark Tab**: `Ctrl+Shift+M` (⌘+Shift+M on Mac)
- **Tile 2 Marked Tabs**: (no default, assign in shortcuts)
- **Tile 4 Marked Tabs**: (no default, assign in shortcuts)

Overlay controls (these cannot be remapped):
- **↑**: Previous card
- **↓**: Next card
- **Enter/Space**: Activate focused card
- **Esc**: Close overlay
- **Mouse wheel**: Navigate cards

## Architecture

### Background Service Worker (`background.js`)
- Central message bus with operation allowlist
- Tab querying and filtering with security checks
- Safe thumbnail capture with focus restoration
- Marked tabs storage and management
- Window tiling with configurable layouts
- Keyboard command handlers
- Context menu integration

### Content Overlay (`content.js` + `content.css`)
- Shadow DOM for style isolation
- 3D card stack with `rotateX` transforms
- Capture-phase event listeners to override page scripts
- Lazy thumbnail loading for performance
- Smooth animations with scrim state machine
- Z-ordering with `isolation: isolate`

### Options Page (`options.html` + `options.js` + `options.css`)
- Comprehensive settings UI with live updates
- Grouped sections with tooltips
- Persistent storage with `chrome.storage.sync`
- Reset to defaults functionality

### Popup (`popup.html` + `popup.js` + `popup.css`)
- Quick access to toggle overlay
- Shortcuts reference
- Links to settings and privacy policy

## Permissions

PageWheel requests only the permissions it needs:

- **tabs**: Query open tabs and switch between them
- **storage**: Save settings and marked tabs locally
- **contextMenus**: Add right-click menu items
- **host_permissions (all_urls)**: Capture tab thumbnails and inject overlay

No data is sent to external servers. All processing happens locally in your browser.

## Privacy Policy

PageWheel does not collect, store, or transmit any personal or sensitive user data beyond your browser. All settings, marked tabs, and preferences are stored locally using Chrome's storage APIs. No analytics, tracking, or advertising cookies are used.

For the full privacy policy, see [index.html](index.html).

## Development

### Project Structure
```
pagemarks-privacy/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker
├── content.js             # Content script (overlay)
├── content.css            # Overlay styles
├── popup.html/js/css      # Popup UI
├── options.html/js/css    # Settings page
├── icons/                 # Extension icons
├── build.js               # Build script
├── generate-icons.py      # Icon generator
└── package.json           # NPM config
```

### Code Quality
- No TODOs or placeholders
- Defensive coding with error handling
- Detailed logging (user-controllable)
- Clean separation of concerns
- Accessible and semantic HTML

## Troubleshooting

### Overlay doesn't open
- Ensure you're on a supported page (not chrome://, edge://, or extension pages by default)
- Check browser console for errors
- Try reloading the page
- Verify the extension is enabled in `chrome://extensions`

### Keyboard shortcuts don't work
- Make sure no other extension uses the same shortcuts
- Customize shortcuts at `chrome://extensions/shortcuts`
- In-overlay controls (↑/↓/Enter/Space/Esc) always work if overlay is open

### Thumbnails not loading
- PageWheel needs permission to capture visible tabs
- Some sites may block thumbnail capture (fallback to favicon + title)
- Enable "No Thumbnails Mode" in settings for privacy/performance

### Tiling doesn't work
- Mark at least 2 (or 4) tabs first
- Ensure sufficient screen space
- Check security settings don't block the tabs

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

Created by the PageWheel Team

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@fusiontechnology.com

## Changelog

### Version 1.0.0
- Initial release
- 3D vertical Rolodex with smooth flipping
- Keyboard and mouse wheel controls
- Tab marking and tiling (2-up, 4-up)
- Comprehensive settings
- Security and privacy features
- Accessibility support
- Dark theme with cyan accents

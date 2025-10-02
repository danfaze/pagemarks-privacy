# Changelog

All notable changes to PageWheel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-15

### Added
- 3D vertical Rolodex overlay with face-on orientation
- Smooth card flipping with GPU-accelerated transforms
- Live tab previews with thumbnails, favicons, and titles
- Keyboard controls: ↑/↓ for navigation, Enter/Space to activate, Esc to close
- Mouse wheel navigation through cards
- Global keyboard shortcuts (Ctrl+Shift+W to toggle, Ctrl+Shift+M to mark)
- Tab marking system with configurable maximum
- Window tiling commands (2-up and 4-up layouts)
- Blue transparent scrim visible only during rotation
- Comprehensive settings page with grouped options
- Security filtering for URL protocols
- Privacy-focused: no data collection, all local storage
- Accessibility features: keyboard navigation, ARIA labels, reduced motion support
- Dark theme with deep-sea blues and cyan accents
- Popup UI with quick actions
- Context menu integration
- Shadow DOM for style isolation
- Capture-phase event listeners to prevent page interference
- Lazy thumbnail loading for performance
- Fallback UI for thumbnail failures
- AbortController cleanup for robust listener management
- Detailed logging with user-controllable levels
- Settings persistence across sessions
- Reset to defaults functionality
- High contrast mode support
- Responsive design for options page
- Build and packaging scripts

### Security
- Principle of least privilege with minimal permissions
- Protocol filtering (blocks chrome://, edge://, chrome-extension: by default)
- Optional file:// and data:// URL support
- Message bus with operation allowlist
- Safe focus restoration after thumbnail capture
- Rate limiting for captures
- Input validation and error handling throughout

### Performance
- GPU-accelerated 3D transforms
- Will-change optimization
- Minimal forced reflow
- Lazy loading of thumbnails
- Efficient state management
- < 4ms work per frame target

### Accessibility
- Full keyboard navigation
- Respects prefers-reduced-motion
- ARIA labels and semantic HTML
- Focus indicators
- Sufficient contrast ratios
- Alternative list layout option

[1.0.0]: https://github.com/danfaze/pagemarks-privacy/releases/tag/v1.0.0

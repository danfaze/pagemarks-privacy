// Simple icon generator using Canvas (node-canvas would be needed in production)
// For now, we'll create placeholder SVG files that Chrome can use
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon with a wheel/rolodex design
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a3a52;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d1f2d;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="url(#bg)"/>
  <g transform="translate(${size/2},${size/2})">
    <rect x="${-size*0.3}" y="${-size*0.35}" width="${size*0.6}" height="${size*0.15}" rx="${size*0.02}" fill="#4dd0e1" opacity="0.9"/>
    <rect x="${-size*0.3}" y="${-size*0.15}" width="${size*0.6}" height="${size*0.15}" rx="${size*0.02}" fill="#4dd0e1" opacity="0.7"/>
    <rect x="${-size*0.3}" y="${size*0.05}" width="${size*0.6}" height="${size*0.15}" rx="${size*0.02}" fill="#4dd0e1" opacity="0.5"/>
    <rect x="${-size*0.3}" y="${size*0.25}" width="${size*0.6}" height="${size*0.15}" rx="${size*0.02}" fill="#4dd0e1" opacity="0.3"/>
  </g>
</svg>`;
}

// For production, we'd convert SVG to PNG
// For now, we'll create base64 encoded PNGs manually
// Using a minimal approach with Canvas API simulation

// Create simple colored rectangles as PNGs using Buffer
function createPNG(size) {
  // This is a minimal PNG file (1x1 pixel) that we'll scale conceptually
  // In a real implementation, you'd use node-canvas or sharp
  // For now, create a valid but basic PNG
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  ]);
  
  // For a proper implementation, we need a full PNG encoder
  // Let's create SVG files instead which Chrome extensions can use
  return createSVG(size);
}

// Generate icons
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✓ Created icon${size}.svg`);
});

console.log('\n✨ Icons generated!');
console.log('Note: For production, convert SVG to PNG using a proper tool.');

const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create icons directory in dist
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Copy files to dist
const filesToCopy = [
  'manifest.json',
  'background.js',
  'content.js',
  'content.css',
  'popup.html',
  'popup.js',
  'popup.css',
  'options.html',
  'options.js',
  'options.css'
];

filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } else {
    console.log(`⚠ Skipped ${file} (not found)`);
  }
});

// Copy icons
const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
iconFiles.forEach(file => {
  const src = path.join(__dirname, 'icons', file);
  const dest = path.join(iconsDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied icons/${file}`);
  }
});

console.log('\n✨ Build complete! Output in dist/');

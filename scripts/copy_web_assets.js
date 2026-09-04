const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(rootDir, 'assets');

if (fs.existsSync(distDir)) {
  // 1. Copy all favicon and icon assets to dist
  const assetFiles = ['favicon.ico', 'favicon.png', 'favicon.svg', 'icon.png', 'splash.png'];
  for (const file of assetFiles) {
    const srcPath = path.join(assetsDir, file);
    const destPath = path.join(distDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 2. Ensure dist/index.html includes all favicon link tags and theme color
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const faviconTags = `
    <!-- ClassDesk Web Favicon & Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
    <meta name="theme-color" content="#386AEB" />
`;

    if (!html.includes('href="/favicon.svg"')) {
      html = html.replace('</head>', `${faviconTags}</head>`);
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Successfully injected favicon tags into dist/index.html');
    }
  }
}

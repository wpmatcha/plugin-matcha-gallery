const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const photoPath = path.join(baseDir, 'gallery-mosaic-square.jpg');
const svgPath = path.join(baseDir, 'icon.svg');
const pluginSvgPath = path.join(baseDir, '..', 'assets', 'images', 'icon.svg');
const pluginImgPath = path.join(baseDir, '..', 'assets', 'images', 'gallery-mosaic-square.jpg');

const b64 = fs.readFileSync(photoPath).toString('base64');
fs.copyFileSync(photoPath, pluginImgPath);

// Pure Symbol Mode (High-CTR / No Text):
// Centered at (128, 128), 162x166px leaf contour, pin-sharp at 64px, 128px, 256px
const leafPathCentered = "M 47,45 L 147,45 A 62,62 0 0,1 209,107 L 209,211 L 109,211 A 62,62 0 0,1 47,149 Z";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <clipPath id="leafClip_pure_symbol">
      <path d="${leafPathCentered}" />
    </clipPath>
  </defs>
  <g>
    <!-- Matte Sage Background (#73907F) -->
    <rect width="256" height="256" fill="#73907F" />

    <!-- Mosaic Gallery inside Centered Leaf Contour -->
    <g clip-path="url(#leafClip_pure_symbol)">
      <image href="data:image/jpeg;base64,${b64}" x="34" y="32" width="188" height="188" preserveAspectRatio="xMidYMid slice" />
      <rect x="34" y="32" width="188" height="188" fill="#73907F" opacity="0.14" />
    </g>

    <!-- White Leaf-Box Border (2.2px) -->
    <path d="${leafPathCentered}" fill="none" stroke="#FFFFFF" stroke-width="2.2" />

    <!-- 4 Concentric Gyre Loops centered at (128, 128) -->
    <ellipse cx="128" cy="128" rx="62" ry="48" transform="rotate(-22 128 128)" 
             fill="none" stroke="#FFFFFF" stroke-width="2.0" opacity="0.90" />
    <ellipse cx="128" cy="128" rx="56" ry="45" transform="rotate(24 128 128)" 
             fill="none" stroke="#FFFFFF" stroke-width="2.0" opacity="0.85" />
    <ellipse cx="128" cy="128" rx="48" ry="40" transform="rotate(-8 128 128)" 
             fill="none" stroke="#FFFFFF" stroke-width="2.0" opacity="0.80" />
    <ellipse cx="128" cy="128" rx="36" ry="29" transform="rotate(12 128 128)" 
             fill="none" stroke="#FFFFFF" stroke-width="2.0" opacity="0.95" />
  </g>
</svg>`;

fs.writeFileSync(svgPath, svg, 'utf8');
fs.writeFileSync(pluginSvgPath, svg, 'utf8');
console.log('icon.svg compiled with pure symbol SVG to both .wordpress-org and assets/images!');



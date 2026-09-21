const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const photoPath = path.join(baseDir, 'gallery-mosaic-square.jpg');
const svgPath = path.join(baseDir, 'icon.svg');
const pluginSvgPath = path.join(baseDir, '..', 'assets', 'images', 'icon.svg');
const pluginImgPath = path.join(baseDir, '..', 'assets', 'images', 'gallery-mosaic-square.jpg');

const b64 = fs.readFileSync(photoPath).toString('base64');
fs.copyFileSync(photoPath, pluginImgPath);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <clipPath id="leafClip_1_standalone">
      <path d="M 68,24 L 142,24 A 46,46 0 0,1 188,70 L 188,146 L 114,146 A 46,46 0 0,1 68,100 Z" />
    </clipPath>
  </defs>
  <g>
    <!-- Matte Sage Background -->
    <rect width="256" height="256" fill="#73907F" />

    <!-- Mosaic Gallery inside Leaf Contour -->
    <g clip-path="url(#leafClip_1_standalone)">
      <image href="data:image/jpeg;base64,${b64}" x="58" y="14" width="140" height="140" preserveAspectRatio="xMidYMid slice" />
      <rect x="58" y="14" width="140" height="140" fill="#73907F" opacity="0.18" />
    </g>

    <!-- White Leaf-Box Border -->
    <path d="M 68,24 L 142,24 A 46,46 0 0,1 188,70 L 188,146 L 114,146 A 46,46 0 0,1 68,100 Z" 
          fill="none" stroke="#FFFFFF" stroke-width="1.8" />

    <!-- 4 Tilted Gyre Loops over the mosaic -->
    <ellipse cx="128" cy="85" rx="46" ry="36" transform="rotate(-22 128 85)" 
             fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.9" />
    <ellipse cx="128" cy="85" rx="42" ry="34" transform="rotate(24 128 85)" 
             fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.85" />
    <ellipse cx="128" cy="85" rx="36" ry="30" transform="rotate(-8 128 85)" 
             fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.8" />
    <ellipse cx="128" cy="85" rx="27" ry="22" transform="rotate(12 128 85)" 
             fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.95" />

    <!-- Brand Title: Matcha Gallery -->
    <text x="128" y="184" font-family="'Outfit', sans-serif" font-weight="800" font-size="22" letter-spacing="-0.4" fill="#FFFFFF" text-anchor="middle">Matcha Gallery</text>

    <!-- Subtitle: AI Smart Gallery -->
    <text x="128" y="206" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="8.5" letter-spacing="2.4" fill="#FFFFFF" text-anchor="middle" opacity="0.92">AI SMART GALLERY</text>

    <!-- Centered Accent Twin Leaf -->
    <g transform="translate(122, 218) scale(0.12)">
      <path d="M 45 88 C 30 78 13 58 15 28 C 16 16 18 10 19 9 C 23 15 35 32 43 55 C 47 67 47 78 45 88 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M 53 142 C 50 128 54 112 62 98 C 76 83 106 66 128 42 C 131 32 132 24 132 23 C 128 26 102 38 72 58 C 54 75 48 98 52 118 C 54 126 53 135 53 142 Z" fill="#FFFFFF" opacity="0.8" />
    </g>
  </g>
</svg>`;

fs.writeFileSync(svgPath, svg, 'utf8');
fs.writeFileSync(pluginSvgPath, svg, 'utf8');
console.log('icon.svg compiled with exact user SVG to both .wordpress-org and assets/images!');


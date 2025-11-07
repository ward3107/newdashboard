// Simple script to generate PWA icons
// This creates placeholder SVG-based icons
const fs = require('fs');
const path = require('path');

const sizes = [192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

// SVG icon template
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>

  <!-- Brain/AI Icon -->
  <g transform="translate(${size * 0.25}, ${size * 0.25})">
    <!-- Simple representation of AI/Education -->
    <circle cx="${size * 0.25}" cy="${size * 0.25}" r="${size * 0.2}" fill="white" opacity="0.9"/>
    <text x="${size * 0.25}" y="${size * 0.3}"
          font-family="Arial, sans-serif"
          font-size="${size * 0.2}"
          fill="#3B82F6"
          text-anchor="middle"
          font-weight="bold">AI</text>
  </g>

  <!-- Bottom accent -->
  <rect y="${size * 0.85}" width="${size}" height="${size * 0.15}" fill="white" opacity="0.1"/>
</svg>
`;

// Generate icons
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}.svg`;
  const filepath = path.join(publicDir, filename);

  fs.writeFileSync(filepath, svg.trim());
  console.log(`✅ Generated ${filename}`);
});

console.log('\n📱 PWA icons generated successfully!');
console.log('💡 Note: For production, replace these with professionally designed PNG icons.');
console.log('   You can use tools like:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/');
console.log('   - Canva or Figma to create custom icons\n');

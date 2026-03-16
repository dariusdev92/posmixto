const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImagePath = 'public/icon.png';
const outputDir = 'public/icons';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    try {
        for (const size of sizes) {
            await sharp(inputImagePath)
                .resize(size, size)
                .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
            console.log(`Generated icon-${size}x${size}.png`);
        }
        console.log('Successfully generated all PWA icons!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();

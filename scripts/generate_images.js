const fs = require('fs');
const path = require('path');

const DIRECTORY = path.join(__dirname, '../public/palmer_dinnerware');
const OUTPUT_FILE = path.join(__dirname, '../data/all_images.ts');

// Function to get all files in directory
function getImagesFromDir(dir) {
    const files = fs.readdirSync(dir);
    const images = [];

    files.forEach(file => {
        // Filter for image text extensions
        if (/\.(webp|png|jpg|jpeg)$/i.test(file)) {
            // Create public path (relative to public folder)
            images.push(`/palmer_dinnerware/${file}`);
        }
    });

    return images;
}

try {
    const images = getImagesFromDir(DIRECTORY);

    // Sort for consistency
    images.sort();

    const fileContent = `export const ALL_IMAGES = [\n    '${images.join("',\n    '")}',\n];\n`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);

    console.log(`Successfully generated ${images.length} images in ${OUTPUT_FILE}`);
} catch (err) {
    console.error('Error generating images:', err);
    process.exit(1);
}

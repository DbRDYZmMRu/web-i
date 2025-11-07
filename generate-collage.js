const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// List of image URLs (unchanged, 49 images)
const imageUrls = [
    'https://www.frithhilton.com.ng/images/collections/i/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/ii/Cover Image.png',
    'https://www.frithhilton.com.ng/images/collections/iii/Cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/iv/Cover Image.png',
    'https://www.frithhilton.com.ng/images/collections/v/cover.png',
    'https://www.frithhilton.com.ng/images/collections/vi/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/vii/Cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/viii/Cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/ix/Cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/x/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xi/cover.jpg',
    'https://raw.githubusercontent.com/DbRDYZmMRu/Ut67QIwioF/refs/heads/main/images/collections/xi-ii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xiii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xiv/cover.jpeg',
    'https://www.frithhilton.com.ng/images/collections/xv/cover.jpeg',
    'https://www.frithhilton.com.ng/images/collections/xvi/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xvii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xviii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xix/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xx/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xxi/cover.jpg',
    'https://raw.githubusercontent.com/DbRDYZmMRu/Ut67QIwioF/refs/heads/main/images/collections/2020-cover.jpg',
    'https://raw.githubusercontent.com/DbRDYZmMRu/fhw-two/refs/heads/main/books/1965/coverDesign.jpg',
    'https://www.frithhilton.com.ng/images/collections/drCarlHillI/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/drCarlHill/two/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/drCarlHill/three/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/drCarlHill/four/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/drCarlHill/five/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/1/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/2/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/3/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/4/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/5/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/6/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/7/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/8/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/9/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/10/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/11/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/12/cover.jpg', 
    'https://www.frithhilton.com.ng/images/collections/xiv/cover.jpeg',
    'https://www.frithhilton.com.ng/images/collections/viii/Cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xiii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xvii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/13/cover.jpg', 
    'https://www.frithhilton.com.ng/images/collections/W2W/14/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/W2W/15/cover.jpg', 
    'https://www.frithhilton.com.ng/images/collections/W2W/16/cover.jpg'
];

// New target resolution: 1080x360 (3:1 aspect ratio)
const targetWidth = 1080;
const targetHeight = 360;

// Grid: 14 cols x 4 rows = 56 cells (we'll use 49, leaving 7 empty)
const cols = 14;
const rows = 4;
const gap = 2; // Reduced gap for tighter fit

// Adjust cell sizes to fit gaps without overflow
const totalHorizontalGaps = (cols - 1) * gap;
const totalVerticalGaps = (rows - 1) * gap;
const cellWidth = (targetWidth - totalHorizontalGaps) / cols;
const cellHeight = (targetHeight - totalVerticalGaps) / rows;

// Create canvas
const canvas = createCanvas(targetWidth, targetHeight);
const ctx = canvas.getContext('2d');

// Enable high-quality smoothing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

async function generateCollage() {
    const images = [];
    let loadedImages = 0;

    // Load all images
    for (const url of imageUrls) {
        try {
            const img = await loadImage(url);
            images.push(img);
        } catch (error) {
            console.log(`Failed to load ${url}: ${error.message}`);
            images.push(null);  // Placeholder
        }
        loadedImages++;
    }

    // Shuffle the images for random placement
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const shuffledImages = shuffleArray([...images]);  // Copy and shuffle all 49

    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw 49 images in shuffled order
    shuffledImages.forEach((img, index) => {
        if (index >= cols * rows) return;  // Cap at 56, but only use 49

        const row = Math.floor(index / cols);
        const col = index % cols;

        if (!img || index >= 49) {
            // Placeholder or skip extras
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(
                col * (cellWidth + gap),
                row * (cellHeight + gap),
                cellWidth,
                cellHeight
            );
            return;
        }

        const x = col * (cellWidth + gap);
        const y = row * (cellHeight + gap);

        // Draw scaled image
        ctx.drawImage(img, x, y, cellWidth, cellHeight);
    });

    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('frith-hilton-book-collage-1080x360.png', buffer);
    console.log(`Collage generated: frith-hilton-book-collage-1080x360.png (49 images in ${cols}x${rows} grid)`);
}

generateCollage().catch(console.error);
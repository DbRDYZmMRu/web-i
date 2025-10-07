const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// List of image URLs from your template (you added extras at the end; kept them)
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
    'https://www.frithhilton.com.ng/images/collections/xiii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xiii/cover.jpg',
    'https://www.frithhilton.com.ng/images/collections/xvii/cover.jpg', 
            'https://www.frithhilton.com.ng/images/collections/ii/Cover Image.png'
];

// High-res settings for clarity
const targetWidth = 1500;
const targetHeight = 500;

// Grid: 15 cols x 3 rows (45 cells for 45 images)
const cols = 15;
const rows = 3;
const cellWidth = targetWidth / cols;
const cellHeight = targetHeight / rows;
const gap = 0;  // No gap for seamless collage

// Create canvas
const canvas = createCanvas(targetWidth, targetHeight);
const ctx = canvas.getContext('2d');

// Enable high-quality smoothing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

async function generateCollage() {
    const images = [];
    let loadedImages = 0;

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

    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw images
    images.forEach((img, index) => {
        if (!img) {
            // Placeholder
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(
                (index % cols) * (cellWidth + gap),
                Math.floor(index / cols) * (cellHeight + gap),
                cellWidth,
                cellHeight
            );
            return;
        }

        const x = (index % cols) * (cellWidth + gap);
        const y = Math.floor(index / cols) * (cellHeight + gap);

        // Draw scaled image
        ctx.drawImage(img, x, y, cellWidth, cellHeight);
    });

    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('frith-hilton-book-collage.png', buffer);
    console.log('Collage generated: frith-hilton-book-collage.png');
}

generateCollage().catch(console.error);
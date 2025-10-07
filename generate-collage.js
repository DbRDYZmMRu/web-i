const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// List of image URLs from your template (45 images)
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
    'https://www.frithhilton.com.ng/images/collections/xvii/cover.jpg'
];

// High-res settings for clarity (square 1:1 ratio)
const targetSize = 1500;
const targetWidth = targetSize;
const targetHeight = targetSize;

// Number of images
const numImages = imageUrls.length;  // 45 images

// Grid: 7 cols x 7 rows = 49 cells
const cols = 7;
const rows = 7;
const gap = 3;

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

    // Load all unique images
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

    const shuffledImages = shuffleArray([...images]);  // Copy and shuffle

    // Create grid assignment: 45 unique + 4 random duplicates
    const grid = new Array(cols * rows).fill(null);
    let uniqueIndex = 0;

    // Place 45 unique images first (shuffled)
    for (let i = 0; i < 45; i++) {
        grid[i] = shuffledImages[uniqueIndex % numImages];  // Use shuffled unique
        uniqueIndex++;
    }

    // For the remaining 4 cells, add random duplicates with no adjacent matches
    const emptyPositions = [];
    for (let i = 45; i < cols * rows; i++) {
        emptyPositions.push(i);
    }

    // Function to get neighbors of a position
    function getNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        directions.forEach(([dr, dc]) => {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbors.push(nr * cols + nc);
            }
        });
        return neighbors;
    }

    // Fill empty positions with safe random duplicates
    emptyPositions.forEach(pos => {
        const row = Math.floor(pos / cols);
        const col = pos % cols;
        const neighbors = getNeighbors(row, col);
        let attempts = 0;
        let selectedImg = null;

        while (attempts < 100) {  // Prevent infinite loop
            const randomIndex = Math.floor(Math.random() * numImages);
            const candidateImg = images[randomIndex];

            // Check if candidate is not in neighbors
            const isSafe = !neighbors.some(neighPos => {
                const neighImg = grid[neighPos];
                return neighImg && neighImg.src === candidateImg.src;  // Compare src to detect duplicates
            });

            if (isSafe && candidateImg) {
                selectedImg = candidateImg;
                break;
            }
            attempts++;
        }

        grid[pos] = selectedImg || images[0] || null;  // Fallback to first image or null
    });

    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw grid
    grid.forEach((img, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        if (!img) {
            // Placeholder if no image
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
    fs.writeFileSync('frith-hilton-book-collage.png', buffer);
    console.log(`Collage generated: frith-hilton-book-collage.png (${numImages} unique + 4 random duplicates in ${cols}x${rows} grid)`);
}

generateCollage().catch(console.error);
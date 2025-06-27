// backend/canvas.js
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const router = express.Router();

// In-memory canvas state (temporary storage)
let canvasState = {
    width: 800,
    height: 600,
    elements: []
};

// Initialize the canvas with dimensions
router.post('/initialize', (req, res) => {
    const { width, height } = req.body;

    canvasState = {
        width: width || 800,
        height: height || 600,
        elements: []
    };

    res.json({ success: true, canvas: canvasState });
});

// Get current canvas state
router.get('/state', (req, res) => {
    res.json({ success: true, canvas: canvasState });
});

// Add rectangle
router.post('/add-rectangle', (req, res) => {
    const { x, y, width, height, color } = req.body;
    const rectangle = {
        type: 'rectangle',
        x: x || 0,
        y: y || 0,
        width: width || 100,
        height: height || 100,
        color: color || '#000000'
    };
    canvasState.elements.push(rectangle);
    res.json({ success: true, element: rectangle });
});

// Add circle
router.post('/add-circle', (req, res) => {
    const { x, y, radius, color } = req.body;
    const circle = {
        type: 'circle',
        x: x || 0,
        y: y || 0,
        radius: radius || 50,
        color: color || '#000000'
    };
    canvasState.elements.push(circle);
    res.json({ success: true, element: circle });
});

// Add text
router.post('/add-text', (req, res) => {
    const { x, y, text, fontSize, color } = req.body;
    const textElement = {
        type: 'text',
        x: x || 0,
        y: y || 0,
        text: text || 'Sample Text',
        fontSize: fontSize || 20,
        color: color || '#000000'
    };
    canvasState.elements.push(textElement);
    res.json({ success: true, element: textElement });
});

// Add image from URL
router.post('/add-image-url', (req, res) => {
    const { imageUrl, x, y, width, height } = req.body;
    const imageElement = {
        type: 'image-url',
        imageUrl,
        x: x || 0,
        y: y || 0,
        width: width || 100,
        height: height || 100
    };
    canvasState.elements.push(imageElement);
    res.json({ success: true, element: imageElement });
});

// Export canvas as PDF
router.post('/export-pdf', async (req, res) => {
    try {
        const doc = new PDFDocument({ size: [canvasState.width, canvasState.height] });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=canvas-export.pdf');
            res.send(pdfData);
        });

        // Draw elements on the PDF
        for (const el of canvasState.elements) {
            if (el.type === 'rectangle') {
                doc.rect(el.x, el.y, el.width, el.height).fill(el.color);
            } else if (el.type === 'circle') {
                doc.circle(el.x, el.y, el.radius).fill(el.color);
            } else if (el.type === 'text') {
                doc.fillColor(el.color).fontSize(el.fontSize).text(el.text, el.x, el.y);
            } else if (el.type === 'image-url') {
                try {
                    const imgRes = await axios.get(el.imageUrl, { responseType: 'arraybuffer' });
                    const imgBuffer = Buffer.from(imgRes.data, 'binary');
                    doc.image(imgBuffer, el.x, el.y, { width: el.width, height: el.height });
                } catch (err) {
                    console.warn('⚠️ Failed to load image:', el.imageUrl);
                }
            }
        }

        doc.end();
    } catch (err) {
        console.error('❌ PDF Export Error:', err);
        res.status(500).json({ success: false, message: 'Failed to export PDF' });
    }
});

module.exports = router;

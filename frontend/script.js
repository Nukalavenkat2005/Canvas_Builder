const API_BASE = 'https://canvas-builder-4.onrender.com/api/canvas';


function showStatus(message, isError = false) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isError ? 'status error' : 'status';
    status.style.display = 'block';
    setTimeout(() => (status.style.display = 'none'), 3000);
}

async function initializeCanvas() {
    const width = parseInt(document.getElementById('canvasWidth').value);
    const height = parseInt(document.getElementById('canvasHeight').value);
    await fetch(`${API_BASE}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width, height }),
    });
    const canvas = document.getElementById('previewCanvas');
    canvas.width = width;
    canvas.height = height;
    updatePreview();
}

async function addRectangle() {
    const payload = {
        x: parseInt(document.getElementById('rectX').value),
        y: parseInt(document.getElementById('rectY').value),
        width: parseInt(document.getElementById('rectWidth').value),
        height: parseInt(document.getElementById('rectHeight').value),
        color: document.getElementById('rectColor').value,
    };
    await fetch(`${API_BASE}/add-rectangle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    updatePreview();
}

async function addCircle() {
    const payload = {
        x: parseInt(document.getElementById('circleX').value),
        y: parseInt(document.getElementById('circleY').value),
        radius: parseInt(document.getElementById('circleRadius').value),
        color: document.getElementById('circleColor').value,
    };
    await fetch(`${API_BASE}/add-circle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    updatePreview();
}

async function addText() {
    const payload = {
        x: parseInt(document.getElementById('textX').value),
        y: parseInt(document.getElementById('textY').value),
        text: document.getElementById('textContent').value,
        fontSize: parseInt(document.getElementById('textSize').value),
        color: document.getElementById('textColor').value,
    };
    await fetch(`${API_BASE}/add-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    updatePreview();
}

async function addImageFromURL() {
    const payload = {
        imageUrl: document.getElementById('imageUrl').value,
        x: parseInt(document.getElementById('imageX').value),
        y: parseInt(document.getElementById('imageY').value),
        width: parseInt(document.getElementById('imageWidth').value),
        height: parseInt(document.getElementById('imageHeight').value),
    };
    await fetch(`${API_BASE}/add-image-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    updatePreview();
}

async function updatePreview() {
    const res = await fetch(`${API_BASE}/state`);
    const data = await res.json();
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const el of data.canvas.elements) {
        if (el.type === 'rectangle') {
            ctx.fillStyle = el.color;
            ctx.fillRect(el.x, el.y, el.width, el.height);
        } else if (el.type === 'circle') {
            ctx.fillStyle = el.color;
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.radius, 0, 2 * Math.PI);
            ctx.fill();
        } else if (el.type === 'text') {
            ctx.fillStyle = el.color;
            ctx.font = `${el.fontSize}px Arial`;
            ctx.fillText(el.text, el.x, el.y);
        } else if (el.type === 'image-url') {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => ctx.drawImage(img, el.x, el.y, el.width, el.height);
            img.src = el.imageUrl;
        }
    }
}

async function exportToPDF() {
    const canvas = document.getElementById('previewCanvas');
    const imageData = canvas.toDataURL('image/png');
    const res = await fetch(`${API_BASE}/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-export.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearCanvas() {
    initializeCanvas();
}

window.onload = () => initializeCanvas();

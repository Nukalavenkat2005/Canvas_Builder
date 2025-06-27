const express = require('express');
const cors = require('cors');
const path = require('path');
const canvasRoutes = require('./routes/canvas');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 👉 Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// 👉 API routes
app.use('/api/canvas', canvasRoutes);

// 👉 Fallback for SPA routes (if needed)
app.get('/state', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

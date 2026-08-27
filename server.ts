import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServerApp } from './server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createServerApp();
const port = 3000;

// Serve static build from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for client side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`StudentHub server active on port ${port}`);
});

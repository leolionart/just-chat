// Simple Express server for testing the chat widget
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));
app.use(express.static(__dirname));

app.post('/chat', (req, res) => {
  const { message } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    res.json({
      response: `Echo: ${message}`
    });
  }, 1000);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
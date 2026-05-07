import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add a simple health check or API route if needed in the future
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA in dev mode - handle all non-API and non-source requests
    app.use('*', async (req, res, next) => {
      const urlPath = req.originalUrl;
      
      // EXCLUSIONS:
      // 1. API routes
      // 2. Vite internal paths (/@vite, /@fs, /@id)
      // 3. Source files (/src)
      // 4. Files with extensions that are NOT .html (assets)
      if (
        urlPath.startsWith('/api') || 
        urlPath.startsWith('/@vite') || 
        urlPath.startsWith('/@fs') || 
        urlPath.startsWith('/@id') ||
        urlPath.startsWith('/src') ||
        (urlPath.includes('.') && !urlPath.endsWith('.html'))
      ) {
        return next();
      }

      try {
        let template = await fs.readFile(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );

        template = await vite.transformIndexHtml(urlPath, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    
    // Serve static files
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true
    }));

    // SPA fallback: serve index.html for all non-matched routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          res.status(500).send('Server Error: Failed to load index.html');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

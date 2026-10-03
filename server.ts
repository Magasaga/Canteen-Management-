// =========================================================================
// KhabarKoi - Full Stack Server Entrypoint
// Runs Express with Backend REST APIs & mounts Vite on Port 3000
// =========================================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as backendApp } from './Backend/server.js';
import { db } from './database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = backendApp;

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🍱 KhabarKoi Canteen System is LIVE on port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🗄️ Database: ${db.getConnectionInfo().type}`);
    console.log(`📁 Folders: /Frontend | /Backend | /database`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

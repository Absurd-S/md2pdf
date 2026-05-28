import express from 'express';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';
import { setupRoutes } from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createServer(options = {}) {
  const app = express();
  const port = options.port || 3000;
  const host = options.host || '0.0.0.0';

  // Ensure output directory
  const outputDir = resolve(process.cwd(), 'output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // Static files - serve frontend UI
  const webDir = resolve(__dirname, '../web');
  app.use(express.static(webDir));

  // Serve vendor libraries from node_modules (CDN fallback)
  const nodeModulesDir = resolve(__dirname, '../../node_modules');
  app.use('/lib/markdown-it', express.static(resolve(nodeModulesDir, 'markdown-it/dist')));
  app.use('/lib/highlight.js', express.static(resolve(nodeModulesDir, 'highlight.js')));

  // Also serve output directory for file downloads
  app.use('/output', express.static(outputDir));

  // API routes
  setupRoutes(app);

  // Fallback to index.html for SPA
  app.get('/', (req, res) => {
    res.sendFile(resolve(webDir, 'index.html'));
  });

  const server = app.listen(port, host, () => {
    if (options.debug) {
      console.log(`MD2PDF server started on http://${host}:${port}`);
    }
  });

  return server;
}

// Allow direct run: node src/http/server.js
if (process.argv[1] && process.argv[1].includes('server.js')) {
  const port = parseInt(process.env.PORT || '3000', 10);
  createServer({ port, debug: true });
}

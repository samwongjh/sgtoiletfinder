import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import restroomsHandler from './api/restrooms.ts';
import healthHandler from './api/health.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.get('/api/restrooms', (req, res) => {
    void restroomsHandler(
      {
        method: req.method,
        query: req.query as Record<string, string | string[] | undefined>,
      },
      res
    );
  });

  app.get('/api/health', (req, res) => {
    void healthHandler({ method: req.method }, res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import 'dotenv/config';

// Ensure Web Crypto API is available as `globalThis.crypto` for libraries
// that expect the browser-style `crypto` global (fixes "crypto is not defined").
import { webcrypto as nodeWebCrypto } from 'crypto';
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = nodeWebCrypto;
}

import { initDatabase, EventRepository } from './db.ts';
import eventRoutes from './routes/eventRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import applicationRoutes from './routes/applicationRoutes.ts';
import uploadRoutes from './routes/uploadRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: FRONTEND_ORIGIN }));

  await initDatabase();

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'DevEvent Hub API',
      database: EventRepository.getDbStatus(),
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api', uploadRoutes);
  app.use('/api', eventRoutes);
  app.use('/api', authRoutes);
  app.use('/api', applicationRoutes);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'frontend', 'dist');
    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(indexFile);
      });
    } else {
      console.log('[DevEvent Hub] Production mode but frontend/dist not found — skipping static file serving.');
    }
  } else {
    console.log('[DevEvent Hub] Development mode: run frontend with `npm run dev` in /frontend');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevEvent Hub] API server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[DevEvent Hub] Failed to start server:', err);
  process.exit(1);
});

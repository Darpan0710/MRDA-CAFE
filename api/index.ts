import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables for Vercel Serverless Function runtime
dotenv.config();

import { apiRouter } from '../server/routes';
import { db } from '../server/db';

// Ensure credentials sync on function cold start
db.syncAdminCredentialsFromEnv();

const app = express();
app.use(express.json());

// Standard Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Mount all API endpoints under /api and root fallback
app.use('/api', apiRouter);
app.use(apiRouter);

// Health check endpoint
const healthHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'MRDĀ Café API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api', healthHandler);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

export default app;


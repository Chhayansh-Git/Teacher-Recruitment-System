// server/index.js

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { otpLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { startScheduler } from './services/scheduler.js';
import swaggerSpec from './config/swagger.js';

import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportTemplateRoutes from './routes/reportTemplateRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import shortlistRoutes from './routes/shortlistRoutes.js';
import http from 'http';
import { initSocket } from './utils/socket.js';
import { ensureDefaultTemplates } from './models/emailTemplate.js';

// ESM-compatible __dirname resolution:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const app = express();

app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// --- NEW MIDDLEWARE TO PREVENT CACHING ---
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
// -----------------------------------------

app.use('/api/v1/auth/verify-otp', otpLimiter);

// Static uploads path (robust for Node/ESM)
const uploadsPath = path.join(__dirname, 'public', 'uploads');
logger.info(`Static uploads path: ${uploadsPath}`);

// Print mapped static path for all file requests
app.use('/uploads', (req, res, next) => {
  logger.info(`[STATIC DEBUG] Requested: ${req.url} → ${path.join(uploadsPath, req.url)}`);
  next();
});
app.use('/uploads', express.static(uploadsPath)); // Serve /uploads/* files
app.get('/health', (_req, res) => res.status(200).json({ status: 'OK' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

const api = '/api/v1';
app.use(`${api}/auth`, authRoutes);
app.use(`${api}/candidates`, candidateRoutes);
app.use(`${api}/schools`, schoolRoutes);
app.use(`${api}/requirements`, requirementRoutes);
app.use(`${api}/reports`, reportRoutes);
app.use(`${api}/email-templates`, emailTemplateRoutes);
app.use(`${api}/admin`, adminRoutes);
app.use(`${api}/admin/match`, matchRoutes);
app.use(`${api}/push`, pushRoutes);
app.use(`${api}/admin/ai`, aiRoutes);
app.use(`${api}/admin/report-templates`, reportTemplateRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/shortlists', shortlistRoutes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

if (process.env.NODE_ENV !== 'test') {
  logger.info('Connecting to DB...');
  connectDB(process.env.MONGODB_URI)
    .then(async () => {
      logger.info('DB connected. Ensuring default email templates...');
      await ensureDefaultTemplates();
      startScheduler();
      const PORT = process.env.PORT || 5000;
      const server = http.createServer(app);
      initSocket(server);
      server.listen(PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error('❌ Startup error:', err);
      process.exit(1);
    });
}

export default app;
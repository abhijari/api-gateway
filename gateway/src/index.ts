import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { loggingMiddleware } from './middleware/logging';
import { proxyRouter } from './routes/proxy';
import { keysRouter } from './routes/keys';
import { usageRouter } from './routes/usage';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
app.use(loggingMiddleware);

// Routes
app.use('/proxy', proxyRouter);
app.use('/keys', keysRouter);
app.use('/usage', usageRouter);
app.use('/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Gateway server running on port ${PORT}`);
});


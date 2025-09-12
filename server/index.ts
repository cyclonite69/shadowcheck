import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5002;

async function startServer() {
  try {
    const server = await registerRoutes(app);
    server.listen(PORT, () => {
      console.log(`[express] serving on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

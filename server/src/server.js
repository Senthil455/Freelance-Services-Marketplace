import express from 'express';
import { config } from './config/index.js';
import { notFound, errorHandler } from './utils/errors.js';

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;

import express from 'express';

const app = express();

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

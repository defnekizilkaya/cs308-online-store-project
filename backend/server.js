require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const healthRoutes = require('./src/routes/healthRoutes');
app.use('/api', healthRoutes);

// Root
app.get('/', (req, res) => {
  res.send('CS308 Online Store Backend is running.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

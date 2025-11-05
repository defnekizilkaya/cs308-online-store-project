require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./src/routes/product.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const healthRoutes = require('./src/routes/healthRoutes');
app.use('/api', healthRoutes);
app.use('/api/products', productRoutes);

// Root
app.get('/', (req, res) => {
  res.send('CS308 Online Store Backend is running.');
});

// Start server SADECE test değilse
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
  });
}

// Export app for testing
module.exports = app;
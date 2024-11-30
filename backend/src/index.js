require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/analysis.routes');
const Debug = require('./utils/debug');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Analysis routes
app.use('/api', analysisRoutes);
Debug.log('Routes registered', {
  endpoints: [
    '/api/humanity-score/:walletAddress',
    '/api/cluster-analysis/:walletAddress',
    '/api/sybil-activity/:walletAddress/:contractAddress'
  ]
});

// Error handling middleware
app.use((err, req, res, next) => {
  Debug.log('Error occurred', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  Debug.log('Server started', { port: PORT });
  console.log(`Server is running on port ${PORT}`);
});
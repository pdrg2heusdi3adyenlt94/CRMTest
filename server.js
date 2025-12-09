const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const customerRoutes = require('./routes/customers');
const interactionRoutes = require('./routes/interactions');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
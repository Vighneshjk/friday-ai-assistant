const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'All systems nominal, Boss.' });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();

app.use(cors({
    origin: '*', // Allow all for now to debug
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Log every single request that hits the server
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.get('origin')}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'F.R.I.D.A.Y. Core API is online.',
        endpoints: {
            chat: 'POST /api/chat',
            health: 'GET /health'
        }
    });
});

app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'All systems nominal, Boss.' });
});

// Catch-all for 404s
app.use((req, res) => {
    console.warn(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Path ${req.url} not found on this server.` });
});

module.exports = app;

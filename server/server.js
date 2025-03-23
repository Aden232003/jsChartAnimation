const express = require('express');
const cors = require('cors');
const path = require('path');
const yahooFinance = require("yahoo-finance2").default;
const fetch = require("node-fetch");
global.fetch = fetch;

const app = express();

// Configure CORS to allow requests from your Vercel domain
const corsOptions = {
    origin: [
        'https://jschart-sixo-j02g95zex-adens-projects-f5874764.vercel.app', // New Vercel preview URL
        'http://localhost:5173', // Local development
        'https://jschart.vercel.app' // Production URL
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['ripHistorical']);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

/**
 * Fetch historical stock data and process it to return only Date and Close price.
 */
async function fetchStockData(ticker, startDate, endDate, interval) {
    try {
        // Ensure dates are valid
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format");
        }

        if (start > end) {
            throw new Error("Start date cannot be after end date");
        }

        const queryOptions = {
            period1: start,
            period2: end,
            interval: interval
        };
        
        const data = await yahooFinance.historical(ticker, queryOptions);

        if (!data || data.length === 0) {
            throw new Error("No data found for the given ticker and date range.");
        }

        // Process data: keep only Date and Close
        return data.map(entry => ({
            Date: entry.date ? new Date(entry.date).toISOString().split("T")[0] : null,
            Close: entry.close
        })).filter(entry => entry.Date !== null);

    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error;
    }
}

// API endpoint for fetching stock data
app.post('/api/stock-data', async (req, res) => {
    try {
        const { ticker, startDate, endDate, timeframe } = req.body;
        
        if (!ticker || !startDate || !endDate || !timeframe) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const data = await fetchStockData(ticker, startDate, endDate, timeframe);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const yahooFinance = require("yahoo-finance2").default;
const fetch = require("node-fetch");
global.fetch = fetch;

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

/**
 * Fetch historical stock data and process it to return only Date and Close price.
 */
async function fetchStockData(ticker, startDate, endDate, interval) {
    try {
        const queryOptions = {
            period1: new Date(startDate),
            period2: new Date(endDate),
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

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
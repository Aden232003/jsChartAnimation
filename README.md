# Stock Chart Animation

A beautiful and interactive stock chart visualization built with React, D3.js, and TypeScript. Features smooth animations, expandable view, and real-time data fetching.

## Features

- 🎨 Smooth line drawing animation with customizable easing
- 📊 Interactive price tracking with tooltips
- 🔄 Reload animation button
- 📱 Expandable full-screen view
- 📈 Real-time stock data fetching
- 🎯 Precise hover tracking with date and price display

## Tech Stack

- React
- TypeScript
- D3.js
- Vite
- Express
- Yahoo Finance API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jsChartAnimation.git
cd jsChartAnimation
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Start the backend server:
```bash
cd server
node server.js
```

4. In a new terminal, start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

## Usage

1. Enter a stock ticker (e.g., AAPL, META, GOOGL)
2. Select start and end dates
3. Choose the timeframe (daily, weekly, monthly)
4. Click "Fetch Stock Data" to load the chart
5. Use the "Expand" button to view in full screen
6. Click "Reload Animation" to replay the drawing animation
7. Hover over the chart to see exact prices and dates

## License

MIT

## Author

[Your Name]

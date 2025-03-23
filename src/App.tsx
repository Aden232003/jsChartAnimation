import { useState } from 'react'
import './App.css'
import StockChart from './components/StockChart'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    ticker: 'META',
    startDate: '2024-01-01',
    endDate: '2024-03-23',
    timeframe: '1d'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_URL}/api/stock-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }
      
      const data = await response.json()
      setStockData(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Stock Chart Application</h1>
      
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="ticker">Ticker Symbol:</label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleInputChange}
            placeholder="e.g., META, AAPL"
          />
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeframe">Timeframe:</label>
          <select
            id="timeframe"
            name="timeframe"
            value={formData.timeframe}
            onChange={handleInputChange}
          >
            <option value="1d">Daily</option>
            <option value="1wk">Weekly</option>
            <option value="1mo">Monthly</option>
          </select>
        </div>

        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Stock Data'}
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      {stockData.length > 0 && (
        <div className="chart-section">
          <StockChart data={stockData} />
        </div>
      )}
    </div>
  )
}

export default App

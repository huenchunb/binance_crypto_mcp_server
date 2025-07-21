# Binance Crypto MCP Server

A Model Context Protocol (MCP) server that provides cryptocurrency information through Binance's public API, including comprehensive historical analysis and market cycle data.

## Features

- 🚀 Get current price of any cryptocurrency
- 📊 Complete 24-hour statistics (price, volume, changes)
- 🔍 Search cryptocurrency symbols
- 📈 Top cryptocurrencies by trading volume
- 📉 **Basic historical data** (up to 1000 periods)
- 🕰️ **Extended historical data** (up to 12 years with complete analysis)
- 🔄 **Multiple timeframes** (daily, weekly, monthly)
- 🎯 **Market cycle analysis** and volatility metrics
- 📊 **Performance analysis** and advanced statistics
- ⚡ Non-authenticated API (no strict limits)
- 🛡️ Data validation with Zod
- 💾 TypeScript compatible

## Installation

### Option 1: Direct installation with npx

```bash
npx binance-crypto-mcp-server
```

### Option 2: Install from source code

1. Clone the repository:
```bash
git clone <your-repo>
cd binance-crypto-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run the server:
```bash
npm start
```

### Option 3: Development mode

```bash
npm run dev
```

### Option 4: Debug mode

```bash
# With automatic breakpoint
npm run debug:brk

# Without breakpoint
npm run debug

# Automated testing
npm run debug:test
```

## Available Tools

### 1. `get_crypto_price`
Gets the current price of a cryptocurrency.

**Parameters:**
- `symbol` (string): Cryptocurrency symbol (e.g., BTCUSDT, ETHUSDT)

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "price": "$43,250.75",
  "raw_price": "43250.75000000"
}
```

### 2. `get_crypto_24hr_stats`
Gets complete 24-hour statistics for a cryptocurrency.

**Parameters:**
- `symbol` (string): Cryptocurrency symbol

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "current_price": "$43,250.75",
  "price_change_24h": "+$1,250.50",
  "price_change_percent_24h": "+2.98%",
  "high_24h": "$44,100.00",
  "low_24h": "$41,900.25",
  "volume_24h": "25,430.85 BTC",
  "quote_volume_24h": "$1,098,456,789",
  "open_price": "$42,000.25",
  "trade_count_24h": "890,234"
}
```

### 3. `search_crypto_symbols`
Searches for cryptocurrency symbols that match the query.

**Parameters:**
- `query` (string): Text to search for

**Example response:**
```json
{
  "query": "BTC",
  "results_count": 15,
  "symbols": [
    {
      "symbol": "BTCUSDT",
      "base_asset": "BTC",
      "quote_asset": "USDT",
      "status": "TRADING",
      "spot_trading": true,
      "margin_trading": true
    }
  ]
}
```

### 4. `get_top_cryptos_by_volume`
Gets cryptocurrencies with the highest trading volume.

**Parameters:**
- `limit` (number, optional): Number of results (1-50, default: 10)

**Example response:**
```json
{
  "top_cryptos_by_24h_volume": [
    {
      "rank": 1,
      "symbol": "BTCUSDT",
      "price": "$43,250.75",
      "price_change_24h": "+2.98%",
      "volume_24h_usdt": "$1,098,456,789",
      "high_24h": "$44,100.00",
      "low_24h": "$41,900.25"
    }
  ]
}
```

### 5. `get_historical_data`
Gets basic historical data for a cryptocurrency (up to 1000 periods).

**Parameters:**
- `symbol` (string): Cryptocurrency symbol
- `interval` (string, optional): Timeframe - '1d', '1w', '1M' (default: '1d')
- `limit` (number, optional): Number of periods (max 1000, default: 365)

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "interval": "1d",
  "total_periods": 365,
  "date_range": {
    "start": "2023-07-21",
    "end": "2024-07-21"
  },
  "summary": {
    "first_price": "$30,000.50",
    "last_price": "$43,250.75",
    "total_return": "+44.17%",
    "all_time_high": "$73,800.00",
    "all_time_low": "$15,500.25"
  },
  "data": [
    {
      "date": "2023-07-21",
      "open": 30000.50,
      "high": 30500.75,
      "low": 29800.25,
      "close": 30250.00,
      "volume": 15420.85,
      "quote_volume": 467832156.50,
      "trades": 245678
    }
  ]
}
```

### 6. `get_extended_historical_data`
Gets extended historical data with complete market cycle analysis (up to 12 years).

**Parameters:**
- `symbol` (string): Cryptocurrency symbol
- `interval` (string, optional): Timeframe - '1d', '1w', '1M' (default: '1d')  
- `yearsBack` (number, optional): Years back (1-12, default: 4)

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "interval": "1d",
  "extended_analysis": {
    "analysis_period": "1461 1d periods (2020-07-21 to 2024-07-21)",
    "price_performance": {
      "all_time_high": "$73,800.00",
      "all_time_low": "$3,200.00",
      "current_price": "$43,250.75",
      "total_return": "+1,351.27%",
      "roi_from_ath": "-41.39%"
    },
    "volatility_analysis": {
      "average_daily_change": "+0.245%",
      "volatility_index": "4.567%",
      "maximum_gain": "+87.45%",
      "maximum_loss": "-54.32%"
    },
    "market_cycles": {
      "cycle_highs_found": 12,
      "cycle_lows_found": 15,
      "average_cycle_high": "$65,432.18",
      "average_cycle_low": "$18,567.45",
      "current_position": "In normal range"
    }
  },
  "historical_data": {
    "total_records": 1461,
    "sample_recent_data": [
      {
        "timestamp": 1721520000000,
        "date": "2024-07-21",
        "open": 42800.50,
        "high": 43890.75,
        "low": 42650.25,
        "close": 43250.75,
        "volume": 18456.32,
        "quoteVolume": 798567432.18,
        "trades": 567890,
        "change": 450.25,
        "changePercent": 1.05
      }
    ]
  }
}
```

## Usage with Claude Desktop

To use this server with Claude Desktop, add the configuration to your MCP configuration file:

### Windows:
File: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS:
File: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Linux:
File: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "binance-crypto": {
      "command": "npx",
      "args": ["binance-crypto-mcp-server"]
    }
  }
}
```

Or if installed locally:

```json
{
  "mcpServers": {
    "binance-crypto": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Usage Examples

### **Real-time basic data:**
```
"What is the current price of Bitcoin?"
→ Use: get_crypto_price with symbol: "BTCUSDT"

"Show me Ethereum's 24h statistics"
→ Use: get_crypto_24hr_stats with symbol: "ETHUSDT"
```

### **Search and ranking:**
```
"Find all coins related to 'SHIB'"
→ Use: search_crypto_symbols with query: "SHIB"

"What are the top 5 cryptos by volume?"
→ Use: get_top_cryptos_by_volume with limit: 5
```

### **Basic historical analysis:**
```
"How did Bitcoin perform in the last 100 days?"
→ Use: get_historical_data with symbol: "BTCUSDT", limit: 100

"Show me Ethereum's weekly data for the past year"
→ Use: get_historical_data with symbol: "ETHUSDT", interval: "1w", limit: 52
```

### **Cycle and trend analysis:**
```
"Analyze Bitcoin's complete cycles over the last 4 years"
→ Use: get_extended_historical_data with symbol: "BTCUSDT", yearsBack: 4

"What cycle phase is Ethereum in according to its 6-year history?"
→ Use: get_extended_historical_data with symbol: "ETHUSDT", yearsBack: 6

"Compare Bitcoin's volatility using 8 years of monthly data"
→ Use: get_extended_historical_data with symbol: "BTCUSDT", interval: "1M", yearsBack: 8
```

## Popular Symbols

### **Top Cryptocurrencies:**
- **Bitcoin**: BTCUSDT
- **Ethereum**: ETHUSDT
- **BNB**: BNBUSDT
- **Solana**: SOLUSDT
- **XRP**: XRPUSDT

### **Popular Altcoins:**
- **Cardano**: ADAUSDT
- **Dogecoin**: DOGEUSDT
- **Polygon**: MATICUSDT
- **Chainlink**: LINKUSDT
- **Avalanche**: AVAXUSDT

### **DeFi Tokens:**
- **Uniswap**: UNIUSDT
- **Aave**: AAVEUSDT
- **Compound**: COMPUSDT
- **SushiSwap**: SUSHIUSDT

## Available Timeframes

| Interval | Description | Best for |
|----------|-------------|----------|
| `1d` | Daily | Short-medium term trend analysis |
| `1w` | Weekly | Cycle analysis and seasonal patterns |
| `1M` | Monthly | Macro analysis and long-term cycles |

## Limitations

- Uses Binance's public API (no authentication required)
- Subject to Binance rate limiting (typically 1200 requests/minute)
- Data may have slight delay (usually <1 second)
- Some very new symbols may not have complete history
- Historical data limited by Binance availability
- For 8+ year analysis, some tokens may not have sufficient data

## Development

### Project structure
```
src/
├── index.ts          # Main MCP server
├─── helpers
  ├─── binance-client.ts # Binance API client
package.json          # Package configuration
tsconfig.json        # TypeScript configuration
README.md            # Documentation
```

### Available scripts
- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with ts-node
- `npm start`: Run compiled version
- `npm run prepare`: Compile before publishing

## Advanced Use Cases

### **Investment Analysis:**
- Compare historical performance of multiple assets
- Identify market cycles for entry/exit timing
- Volatility analysis for risk management

### **Market Research:**
- Seasonal patterns across different timeframes
- Correlations between different cryptocurrencies
- Post-event analysis (halvings, updates, etc.)

### **Algorithmic Trading:**
- Strategy backtesting with historical data
- Identification of historical support and resistance levels
- Volume and momentum analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-functionality`)
3. Commit your changes (`git commit -am 'Add new functionality'`)
4. Push to the branch (`git push origin feature/new-functionality`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

To report bugs or request features:
- Open an issue on GitHub
- Include usage examples and error logs if applicable
- Specify Node.js version and server version

## Changelog

### v1.0.0
- ✅ Basic price and statistics tools
- ✅ Symbol search functionality
- ✅ Top cryptos by volume
- ✅ Basic historical data (up to 1000 periods)
- ✅ Extended historical analysis (up to 12 years)
- ✅ Market cycle and volatility analysis
- ✅ Multiple timeframes (daily, weekly, monthly)
- ✅ Debug mode and automated testing
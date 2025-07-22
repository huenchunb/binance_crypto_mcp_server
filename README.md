# Binance Crypto MCP Server with Technical Analysis

A Model Context Protocol (MCP) server that provides comprehensive cryptocurrency information through Binance's public API, including **advanced technical analysis** with professional trading indicators.

## 🚀 New Features - Technical Analysis

- **📈 RSI Analysis**: Relative Strength Index with overbought/oversold signals
- **📊 MACD Analysis**: Moving Average Convergence Divergence with crossover detection
- **📉 Moving Averages**: EMA and SMA (20, 50, 200 periods) with trend analysis
- **🎯 Overall Trading Signal**: AI-powered signal combining all indicators
- **🔍 Professional Interpretations**: Human-readable explanations for each indicator
- **⚡ Trading Recommendations**: Entry/exit strategies with risk management

## Features Overview

### Basic Data Tools
- 🚀 Get current price of any cryptocurrency
- 📊 Complete 24-hour statistics (price, volume, changes)
- 🔍 Search cryptocurrency symbols
- 📈 Top cryptocurrencies by trading volume

### Historical Analysis
- 📉 **Basic historical data** (up to 1000 periods)
- 🕰️ **Extended historical data** (up to 12 years with complete analysis)
- 🔄 **Multiple timeframes** (daily, weekly, monthly)
- 🎯 **Market cycle analysis** and volatility metrics

### **🆕 Technical Analysis (NEW)**
- 📈 **RSI (Relative Strength Index)** - Momentum oscillator
- 📊 **MACD (Moving Average Convergence Divergence)** - Trend following
- 📉 **Moving Averages (EMA/SMA)** - Trend identification
- 🎯 **Overall Trading Signal** - Combined indicator analysis
- 💡 **Professional Interpretations** - AI-powered explanations
- ⚡ **Trading Recommendations** - Entry/exit strategies

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

5. Test technical indicators:
```bash
npx ts-node test-technical-indicators.ts
```

## Available Tools

### 🆕 **Technical Analysis Tool**

#### **get_technical_analysis**
Performs comprehensive technical analysis combining RSI, MACD, and moving averages.

**Parameters:**
- `symbol` (string): Cryptocurrency symbol (e.g., BTCUSDT, ETHUSDT)
- `interval` (string, optional): Timeframe - '1d', '1w', '1M' (default: '1d')
- `periods` (number, optional): Data periods (200-500, default: 200)

**Example response:**
```json
{
  "analysis_summary": {
    "symbol": "BTCUSDT",
    "current_price": "$116,892.64",
    "overall_signal": "BUY",
    "confidence": "75%",
    "analysis_date": "2024-07-22T15:30:00.000Z",
    "data_period": "250 1d periods"
  },
  "rsi_analysis": {
    "value": 45.67,
    "signal": "NEUTRAL",
    "strength": "WEAK",
    "interpretation": "RSI en rango normal (45.67). Sin señales extremas, seguir tendencia principal."
  },
  "macd_analysis": {
    "macd_line": 1250.45,
    "signal_line": 980.32,
    "histogram": 270.13,
    "trend": "BULLISH",
    "crossover": "BULLISH_CROSSOVER",
    "interpretation": "Señal alcista: MACD acaba de cruzar por encima de la línea señal."
  },
  "moving_averages_analysis": {
    "ma20": {
      "sma": "$115,234.50",
      "ema": "$115,890.75",
      "trend": "UPTREND",
      "position": "ABOVE"
    },
    "ma50": {
      "sma": "$112,456.80",
      "ema": "$113,220.45", 
      "trend": "UPTREND",
      "position": "ABOVE"
    },
    "ma200": {
      "sma": "$98,567.20",
      "ema": "$101,234.60",
      "trend": "UPTREND",
      "position": "ABOVE"
    },
    "interpretation": "Configuración alcista: EMA20 > EMA50 > EMA200. Tendencia alcista confirmada."
  },
  "trading_recommendations": {
    "action": "BUY",
    "risk_level": "MEDIO - Confianza moderada",
    "entry_strategy": "Entrada gradual recomendada. Considerar compra en pullbacks.",
    "exit_strategy": "Seguir plan de trading establecido.",
    "risk_management": "Stop loss conservador: 2-3%. Reducir tamaño de posición.",
    "market_context": "Mercado en tendencia alcista de largo plazo."
  }
}
```

## 📊 Technical Indicators Explained

### **RSI (Relative Strength Index)**
- **Range**: 0-100
- **Overbought**: RSI > 70 (consider selling)
- **Oversold**: RSI < 30 (consider buying)
- **Neutral**: RSI 30-70 (follow trend)
- **Best for**: Identifying reversal points in volatile crypto markets

### **MACD (Moving Average Convergence Divergence)**
- **Components**: MACD Line, Signal Line, Histogram
- **Bullish Signal**: MACD crosses above Signal Line
- **Bearish Signal**: MACD crosses below Signal Line
- **Trend**: MACD above 0 (bullish), below 0 (bearish)
- **Best for**: Trend changes and momentum analysis

### **Moving Averages (EMA vs SMA)**
- **EMA (Exponential)**: More weight to recent prices - better for crypto
- **SMA (Simple)**: Equal weight to all prices - more stable
- **Periods**: 20 (short-term), 50 (medium-term), 200 (long-term)
- **Best for**: Trend identification and support/resistance levels

## Usage Examples

### **🆕 Technical Analysis Examples:**

#### Complete Technical Analysis
```
"Analyze Bitcoin's technical indicators using daily data"
→ Use: get_technical_analysis with symbol: "BTCUSDT", interval: "1d"

"What do the technical indicators say about Ethereum right now?"
→ Use: get_technical_analysis with symbol: "ETHUSDT", periods: 300

"Give me a technical analysis of Solana using weekly timeframe"
→ Use: get_technical_analysis with symbol: "SOLUSDT", interval: "1w"
```

#### Professional Trading Scenarios
```
"Should I buy Bitcoin right now based on technical analysis?"
→ Returns: Overall signal, RSI levels, MACD crossovers, moving average trends

"What's the risk level for entering a position in Ethereum?"
→ Returns: Risk assessment, entry strategies, stop loss recommendations

"Is this a good time to take profits on my crypto holdings?"
→ Returns: Exit strategies, overbought/oversold conditions, market context
```

## Configuration with Claude Desktop

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

## Development

### Project Structure (Updated)
```
src/
├── index.ts                      # Main MCP server
├── helpers/
│   ├── binance-client.ts         # Binance API client
│   └── technical-indicators.ts   # 🆕 Technical analysis library
test-technical-indicators.ts      # 🆕 Test suite
```

### Testing
```bash
# Run technical indicators tests
npx ts-node test-technical-indicators.ts

# Build project
npm run build

# Start server
npm start
```

## 🎯 Use Cases for Technical Analysis

### **Day Trading**
- **RSI**: Identify overbought/oversold levels for quick entries/exits
- **MACD**: Spot momentum changes for scalping opportunities
- **EMA 20**: Use as dynamic support/resistance for short-term trades

### **Swing Trading**
- **MACD Crossovers**: Identify medium-term trend changes
- **EMA 50**: Trend confirmation for swing positions
- **RSI Divergences**: Spot potential reversal points

### **Long-term Investing**
- **EMA 200**: Determine overall market trend
- **MACD Histogram**: Assess long-term momentum strength
- **Multiple Timeframes**: Confirm signals across daily/weekly/monthly

## Changelog

### v2.0.0 - Technical Analysis Update
- ✅ **NEW**: Complete technical analysis with RSI, MACD, Moving Averages
- ✅ **NEW**: Professional trading recommendations  
- ✅ **NEW**: Risk management suggestions
- ✅ **NEW**: Multi-timeframe analysis support
- ✅ **NEW**: Comprehensive test suite
- ✅ **Enhanced**: Improved error handling and validation

### v1.0.0 - Initial Release
- ✅ Basic price and statistics tools
- ✅ Symbol search functionality
- ✅ Extended historical analysis
- ✅ Market cycle analysis

## License

MIT License - see LICENSE file for details.

---

**⚡ Ready to start professional crypto analysis with technical indicators!**

# Binance Crypto MCP Server

Un servidor MCP (Model Context Protocol) que permite obtener información de criptomonedas a través de la API pública de Binance, incluyendo análisis histórico completo y datos de ciclos de mercado.

## Características

- 🚀 Obtener precio actual de cualquier criptomoneda
- 📊 Estadísticas completas de 24 horas (precio, volumen, cambios)
- 🔍 Búsqueda de símbolos de criptomonedas
- 📈 Top criptomonedas por volumen de trading
- 📉 **Datos históricos básicos** (hasta 1000 períodos)
- 🕰️ **Datos históricos extendidos** (hasta 12 años con análisis completo)
- 🔄 **Múltiples marcos temporales** (diario, semanal, mensual)
- 🎯 **Análisis de ciclos de mercado** y volatilidad
- 📊 **Análisis de rendimiento** y estadísticas avanzadas
- ⚡ API no autenticada (sin límites estrictos)
- 🛡️ Validación de datos con Zod
- 💾 Compatible con TypeScript

## Instalación

### Opción 1: Instalación directa con npx

```bash
npx binance-crypto-mcp-server
```

### Opción 2: Instalación desde código fuente

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd binance-crypto-mcp-server
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el proyecto:
```bash
npm run build
```

4. Ejecuta el servidor:
```bash
npm start
```

### Opción 3: Modo desarrollo

```bash
npm run dev
```

### Opción 4: Modo debugging

```bash
# Con breakpoint automático
npm run debug:brk

# Sin breakpoint
npm run debug

# Testing automatizado
npm run debug:test
```

## Herramientas Disponibles

### 1. `get_crypto_price`
Obtiene el precio actual de una criptomoneda.

**Parámetros:**
- `symbol` (string): Símbolo de la criptomoneda (ej: BTCUSDT, ETHUSDT)

**Ejemplo de respuesta:**
```json
{
  "symbol": "BTCUSDT",
  "price": "$43,250.75",
  "raw_price": "43250.75000000"
}
```

### 2. `get_crypto_24hr_stats`
Obtiene estadísticas completas de 24 horas para una criptomoneda.

**Parámetros:**
- `symbol` (string): Símbolo de la criptomoneda

**Ejemplo de respuesta:**
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
Busca símbolos de criptomonedas que coincidan con la consulta.

**Parámetros:**
- `query` (string): Texto a buscar

**Ejemplo de respuesta:**
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
Obtiene las criptomonedas con mayor volumen de trading.

**Parámetros:**
- `limit` (number, opcional): Número de resultados (1-50, default: 10)

**Ejemplo de respuesta:**
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
Obtiene datos históricos básicos de una criptomoneda (hasta 1000 períodos).

**Parámetros:**
- `symbol` (string): Símbolo de la criptomoneda
- `interval` (string, opcional): Marco temporal - '1d', '1w', '1M' (default: '1d')
- `limit` (number, opcional): Número de períodos (máximo 1000, default: 365)

**Ejemplo de respuesta:**
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
Obtiene datos históricos extendidos con análisis completo de ciclos de mercado (hasta 12 años).

**Parámetros:**
- `symbol` (string): Símbolo de la criptomoneda
- `interval` (string, opcional): Marco temporal - '1d', '1w', '1M' (default: '1d')  
- `yearsBack` (number, opcional): Años hacia atrás (1-12, default: 4)

**Ejemplo de respuesta:**
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

## Uso con Claude Desktop

Para usar este servidor con Claude Desktop, agrega la configuración en tu archivo de configuración MCP:

### Windows:
Archivo: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS:
Archivo: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Linux:
Archivo: `~/.config/Claude/claude_desktop_config.json`

**Configuración:**
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

O si lo instalaste localmente:

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

## Ejemplos de Uso

### **Datos básicos en tiempo real:**
```
"¿Cuál es el precio actual de Bitcoin?"
→ Usa: get_crypto_price con symbol: "BTCUSDT"

"Muéstrame las estadísticas de 24h de Ethereum"
→ Usa: get_crypto_24hr_stats con symbol: "ETHUSDT"
```

### **Búsqueda y ranking:**
```
"Busca todas las monedas relacionadas con 'SHIB'"
→ Usa: search_crypto_symbols con query: "SHIB"

"¿Cuáles son las top 5 criptos por volumen?"
→ Usa: get_top_cryptos_by_volume con limit: 5
```

### **Análisis histórico básico:**
```
"¿Cómo se comportó Bitcoin en los últimos 100 días?"
→ Usa: get_historical_data con symbol: "BTCUSDT", limit: 100

"Muéstrame datos semanales de Ethereum del último año"
→ Usa: get_historical_data con symbol: "ETHUSDT", interval: "1w", limit: 52
```

### **Análisis de ciclos y tendencias:**
```
"Analiza los ciclos completos de Bitcoin de los últimos 4 años"
→ Usa: get_extended_historical_data con symbol: "BTCUSDT", yearsBack: 4

"¿En qué fase del ciclo está Ethereum según su historial de 6 años?"
→ Usa: get_extended_historical_data con symbol: "ETHUSDT", yearsBack: 6

"Compara la volatilidad de Bitcoin usando datos mensuales de 8 años"
→ Usa: get_extended_historical_data con symbol: "BTCUSDT", interval: "1M", yearsBack: 8
```

## Símbolos Populares

### **Top Criptomonedas:**
- **Bitcoin**: BTCUSDT
- **Ethereum**: ETHUSDT
- **BNB**: BNBUSDT
- **Solana**: SOLUSDT
- **XRP**: XRPUSDT

### **Altcoins Populares:**
- **Cardano**: ADAUSDT
- **Dogecoin**: DOGEUSDT
- **Polygon**: MATICUSDT
- **Chainlink**: LINKUSDT
- **Avalanche**: AVAXUSDT

### **Tokens DeFi:**
- **Uniswap**: UNIUSDT
- **Aave**: AAVEUSDT
- **Compound**: COMPUSDT
- **SushiSwap**: SUSHIUSDT

## Marcos Temporales Disponibles

| Intervalo | Descripción | Mejor para |
|-----------|-------------|------------|
| `1d` | Diario | Análisis de tendencias de corto-mediano plazo |
| `1w` | Semanal | Análisis de ciclos y patrones estacionales |
| `1M` | Mensual | Análisis macro y ciclos de largo plazo |

## Limitaciones

- Usa la API pública de Binance (sin autenticación)
- Límites de rate limiting de Binance (generalmente 1200 requests/minuto)
- Los datos pueden tener un ligero retraso (generalmente <1 segundo)
- Algunos símbolos muy nuevos pueden no tener historial completo
- Datos históricos limitados por la disponibilidad en Binance
- Para análisis de 8+ años, algunos tokens pueden no tener datos suficientes

## Desarrollo

### Estructura del proyecto
```
src/
├── index.ts          # Servidor MCP principal
├── binance-client.ts # Cliente para API de Binance
scripts/
├── test-mcp.js      # Script de testing para debugging
package.json          # Configuración del paquete
tsconfig.json        # Configuración de TypeScript
README.md           # Documentación
```

### Scripts disponibles
- `npm run build`: Compila TypeScript a JavaScript
- `npm run dev`: Ejecuta en modo desarrollo con ts-node
- `npm start`: Ejecuta la versión compilada
- `npm run debug`: Ejecuta con inspector de Node.js
- `npm run debug:brk`: Ejecuta con inspector y breakpoint automático
- `npm run debug:test`: Testing automatizado con debugging
- `npm run prepare`: Compila antes de publicar

### Debugging
Para debuggear el servidor:

1. **Compilar y ejecutar con inspector:**
   ```bash
   npm run build
   npm run debug:brk
   ```

2. **Abrir Chrome DevTools:**
   - Ve a `chrome://inspect`
   - Haz clic en "Open dedicated DevTools for Node"

3. **O usar el script de testing:**
   ```bash
   npm run debug:test
   ```

## Casos de Uso Avanzados

### **Análisis de Inversión:**
- Comparar rendimiento histórico de múltiples assets
- Identificar ciclos de mercado para timing de entrada/salida
- Análisis de volatilidad para gestión de riesgo

### **Investigación de Mercado:**
- Patrones estacionales en diferentes marcos temporales
- Correlaciones entre diferentes criptomonedas
- Análisis post-eventos (halvings, actualizaciones, etc.)

### **Trading Algorítmico:**
- Backtesting de estrategias con datos históricos
- Identificación de soportes y resistencias históricas
- Análisis de volumen y momentum

## Contribución

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles.

## Soporte

Para reportar bugs o solicitar features:
- Abre un issue en GitHub
- Incluye ejemplos de uso y logs de error si aplica
- Especifica la versión de Node.js y del servidor

## Changelog

### v1.0.0
- ✅ Herramientas básicas de precio y estadísticas
- ✅ Búsqueda de símbolos
- ✅ Top criptos por volumen
- ✅ Datos históricos básicos (hasta 1000 períodos)
- ✅ Análisis histórico extendido (hasta 12 años)
- ✅ Análisis de ciclos de mercado y volatilidad
- ✅ Múltiples marcos temporales (diario, semanal, mensual)
- ✅ Modo debugging y testing automatizado
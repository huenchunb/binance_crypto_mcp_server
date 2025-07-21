# Binance Crypto MCP Server

Un servidor MCP (Model Context Protocol) que permite obtener información de criptomonedas a través de la API pública de Binance.

## Características

- 🚀 Obtener precio actual de cualquier criptomoneda
- 📊 Estadísticas completas de 24 horas (precio, volumen, cambios)
- 🔍 Búsqueda de símbolos de criptomonedas
- 📈 Top criptomonedas por volumen de trading
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

## Uso con Claude Desktop

Para usar este servidor con Claude Desktop, agrega la configuración en tu archivo de configuración MCP:

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

### Obtener precio de Bitcoin
```
Usa la herramienta get_crypto_price con symbol: "BTCUSDT"
```

### Ver estadísticas de Ethereum
```
Usa la herramienta get_crypto_24hr_stats con symbol: "ETHUSDT"
```

### Buscar tokens relacionados con "SHIB"
```
Usa la herramienta search_crypto_symbols con query: "SHIB"
```

### Ver top 5 criptos por volumen
```
Usa la herramienta get_top_cryptos_by_volume con limit: 5
```

## Símbolos Populares

- **Bitcoin**: BTCUSDT
- **Ethereum**: ETHUSDT
- **BNB**: BNBUSDT
- **Solana**: SOLUSDT
- **Cardano**: ADAUSDT
- **Dogecoin**: DOGEUSDT
- **Polygon**: MATICUSDT
- **Chainlink**: LINKUSDT

## Limitaciones

- Usa la API pública de Binance (sin autenticación)
- Los datos pueden tener un ligero retraso
- Algunos símbolos pueden no estar disponibles
- Límites de rate limiting de la API de Binance

## Desarrollo

### Estructura del proyecto
```
src/
├── index.ts          # Servidor MCP principal
├── binance-client.ts # Cliente para API de Binance
package.json          # Configuración del paquete
tsconfig.json        # Configuración de TypeScript
README.md           # Documentación
```

### Scripts disponibles
- `npm run build`: Compila TypeScript a JavaScript
- `npm run dev`: Ejecuta en modo desarrollo con ts-node
- `npm start`: Ejecuta la versión compilada
- `npm run prepare`: Compila antes de publicar

## Contribución

1. Fork el repositorio
2. Crea una branch para tu feature
3. Haz commit de tus cambios
4. Push a la branch
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles.
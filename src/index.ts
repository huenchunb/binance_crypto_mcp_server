import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool
} from '@modelcontextprotocol/sdk/types.js';
import { BinanceClient } from './helpers/binance-client';
import { PriceData } from './indicators/types/IndicatorTypes';
import { TechnicalAnalysisEngine } from './indicators/engine/TechnicalAnalysisEngine';
import { IndicatorFactory } from './indicators/factory/IndicatorFactory';

class BinanceMCPServer {
    private server: Server;
    private binanceClient: BinanceClient;

    constructor() {
        this.server = new Server(
            {
                name: 'binance-crypto-mcp-server',
                version: '1.0.0',
            }
        );

        this.binanceClient = new BinanceClient();
        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        // Handler para listar herramientas disponibles
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_crypto_price',
                        description: 'Obtiene el precio actual de una criptomoneda',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo de la criptomoneda (ej: BTCUSDT, ETHUSDT)',
                                },
                            },
                            required: ['symbol'],
                        },
                    },
                    {
                        name: 'get_crypto_24hr_stats',
                        description: 'Obtiene estadísticas de 24 horas para una criptomoneda',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo de la criptomoneda (ej: BTCUSDT, ETHUSDT)',
                                },
                            },
                            required: ['symbol'],
                        },
                    },
                    {
                        name: 'search_crypto_symbols',
                        description: 'Busca símbolos de criptomonedas que coincidan con la consulta',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'Texto a buscar en los símbolos (ej: BTC, ETH)',
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'get_top_cryptos_by_volume',
                        description: 'Obtiene las criptomonedas con mayor volumen de trading',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                limit: {
                                    type: 'number',
                                    description: 'Número de criptomonedas a retornar (máximo 50)',
                                    default: 10,
                                },
                            },
                        },
                    },
                    {
                        name: 'get_historical_data',
                        description: 'Obtiene datos históricos básicos de una criptomoneda (hasta 1000 períodos)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo de la criptomoneda (ej: BTCUSDT)',
                                },
                                interval: {
                                    type: 'string',
                                    enum: ['1d', '1w', '1M'],
                                    description: 'Marco temporal: 1d (diario), 1w (semanal), 1M (mensual)',
                                    default: '1d',
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Número de períodos a obtener (máximo 1000)',
                                    default: 365,
                                },
                            },
                            required: ['symbol'],
                        },
                    },
                    {
                        name: 'get_extended_historical_data',
                        description: 'Obtiene datos históricos extendidos con análisis completo (hasta 8+ años)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo de la criptomoneda (ej: BTCUSDT)',
                                },
                                interval: {
                                    type: 'string',
                                    enum: ['1d', '1w', '1M'],
                                    description: 'Marco temporal: 1d (diario), 1w (semanal), 1M (mensual)',
                                    default: '1d',
                                },
                                yearsBack: {
                                    type: 'number',
                                    description: 'Años hacia atrás a obtener (máximo 12 años)',
                                    default: 4,
                                    minimum: 1,
                                    maximum: 12,
                                },
                            },
                            required: ['symbol'],
                        },
                    },
                    {
                        name: 'get_technical_analysis',
                        description: 'Realiza un análisis técnico completo de una criptomoneda',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo del par (ej: BTCUSDT)',
                                },
                                interval: {
                                    type: 'string',
                                    description: 'Intervalo (ej: 1h, 4h, 1d)',
                                },
                                output_mode: {
                                    type: 'string',
                                    enum: ['summary', 'full_data'],
                                    description: 'Modo de salida: resumen o datos completos',
                                    default: 'summary',
                                },
                            },
                            required: ['symbol', 'interval']
                        },
                    },
                    {
                        name: 'get_indicator_values',
                        description: 'Obtiene los valores históricos de uno o más indicadores técnicos',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                symbol: {
                                    type: 'string',
                                    description: 'Símbolo del par (ej: BTCUSDT)',
                                },
                                interval: {
                                    type: 'string',
                                    description: 'Intervalo (ej: 1h, 4h, 1d)',
                                },
                                indicators: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        enum: IndicatorFactory.getAvailableIndicators(),
                                    },
                                    description: 'Array de indicadores a calcular (ej: ["RSI", "MACD"])',
                                },
                            },
                            required: ['symbol', 'interval', 'indicators']
                        },
                    }
                ] satisfies Tool[],
            };
        });

        // Handler para ejecutar herramientas
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'get_crypto_price': {
                        const { symbol } = args as { symbol: string };
                        const priceData = await this.binanceClient.getPrice(symbol);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        symbol: priceData.symbol,
                                        price: `${parseFloat(priceData.price).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        raw_price: priceData.price,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_crypto_24hr_stats': {
                        const { symbol } = args as { symbol: string };
                        const ticker = await this.binanceClient.get24hrTicker(symbol);

                        const priceChange = parseFloat(ticker.priceChange);
                        const priceChangePercent = parseFloat(ticker.priceChangePercent);
                        const currentPrice = parseFloat(ticker.lastPrice);
                        const volume24h = parseFloat(ticker.volume);
                        const quoteVolume24h = parseFloat(ticker.quoteVolume);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        symbol: ticker.symbol,
                                        current_price: `${currentPrice.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        price_change_24h: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(4)}`,
                                        price_change_percent_24h: `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`,
                                        high_24h: `${parseFloat(ticker.highPrice).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        low_24h: `${parseFloat(ticker.lowPrice).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        volume_24h: `${volume24h.toLocaleString('en-US')} ${ticker.symbol.replace('USDT', '').replace('BUSD', '')}`,
                                        quote_volume_24h: `${quoteVolume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                                        open_price: `${parseFloat(ticker.openPrice).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        trade_count_24h: ticker.count.toLocaleString('en-US'),
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'search_crypto_symbols': {
                        const { query } = args as { query: string };
                        const symbols = await this.binanceClient.searchSymbols(query);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        query: query,
                                        results_count: symbols.length,
                                        symbols: symbols.map(symbol => ({
                                            symbol: symbol.symbol,
                                            base_asset: symbol.baseAsset,
                                            quote_asset: symbol.quoteAsset,
                                            status: symbol.status,
                                            spot_trading: symbol.isSpotTradingAllowed,
                                            margin_trading: symbol.isMarginTradingAllowed,
                                        })),
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_top_cryptos_by_volume': {
                        const { limit = 10 } = args as { limit?: number };
                        const topCryptos = await this.binanceClient.getTopSymbolsByVolume(Math.min(limit, 50));

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        top_cryptos_by_24h_volume: topCryptos.map((crypto, index) => ({
                                            rank: index + 1,
                                            symbol: crypto.symbol,
                                            price: `${parseFloat(crypto.lastPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                            price_change_24h: `${parseFloat(crypto.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(crypto.priceChangePercent).toFixed(2)}%`,
                                            volume_24h_usdt: `${parseFloat(crypto.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                                            high_24h: `${parseFloat(crypto.highPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                            low_24h: `${parseFloat(crypto.lowPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                        })),
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_historical_data': {
                        const { symbol, interval = '1d', limit = 365 } = args as {
                            symbol: string;
                            interval?: '1d' | '1w' | '1M';
                            limit?: number;
                        };

                        const historicalData = await this.binanceClient.getHistoricalData(
                            symbol,
                            interval,
                            Math.min(limit, 1000)
                        );

                        // Procesar datos para respuesta más legible
                        const processedData = historicalData.map(kline => ({
                            date: new Date(kline[0]).toISOString().split('T')[0],
                            open: parseFloat(kline[1]),
                            high: parseFloat(kline[2]),
                            low: parseFloat(kline[3]),
                            close: parseFloat(kline[4]),
                            volume: parseFloat(kline[5]),
                            quote_volume: parseFloat(kline[7]),
                            trades: kline[8],
                        }));

                        const firstPrice = processedData[0]?.close || 0;
                        const lastPrice = processedData[processedData.length - 1]?.close || 0;
                        const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        symbol,
                                        interval,
                                        total_periods: processedData.length,
                                        date_range: {
                                            start: processedData[0]?.date,
                                            end: processedData[processedData.length - 1]?.date,
                                        },
                                        summary: {
                                            first_price: `${firstPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                            last_price: `${lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                            total_return: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`,
                                            all_time_high: `${Math.max(...processedData.map(d => d.high)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                            all_time_low: `${Math.min(...processedData.map(d => d.low)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                        },
                                        data: processedData,
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_extended_historical_data': {
                        const { symbol, interval = '1d', yearsBack = 4 } = args as {
                            symbol: string;
                            interval?: '1d' | '1w' | '1M';
                            yearsBack?: number;
                        };

                        const extendedData = await this.binanceClient.getExtendedHistoricalData(
                            symbol,
                            interval,
                            Math.min(Math.max(yearsBack, 1), 12)
                        );

                        // Crear resumen ejecutivo
                        const summary = {
                            analysis_period: `${extendedData.totalPeriods} ${interval} periods (${extendedData.dateRange.start} to ${extendedData.dateRange.end})`,
                            price_performance: {
                                all_time_high: `${extendedData.priceStats.allTimeHigh.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                all_time_low: `${extendedData.priceStats.allTimeLow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                current_price: `${extendedData.priceStats.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
                                total_return: `${extendedData.priceStats.totalReturnPercent >= 0 ? '+' : ''}${extendedData.priceStats.totalReturnPercent.toFixed(2)}%`,
                                roi_from_ath: `${(((extendedData.priceStats.currentPrice - extendedData.priceStats.allTimeHigh) / extendedData.priceStats.allTimeHigh) * 100).toFixed(2)}%`,
                            },
                            volatility_analysis: {
                                average_daily_change: `${extendedData.volatilityStats.averageDailyChange >= 0 ? '+' : ''}${extendedData.volatilityStats.averageDailyChange.toFixed(3)}%`,
                                volatility_index: `${extendedData.volatilityStats.volatility.toFixed(3)}%`,
                                maximum_gain: `+${extendedData.volatilityStats.maxGain.toFixed(2)}%`,
                                maximum_loss: `${extendedData.volatilityStats.maxLoss.toFixed(2)}%`,
                            },
                            market_cycles: this.analyzeMarketCycles(extendedData.data),
                        };

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        symbol: extendedData.symbol,
                                        interval: extendedData.interval,
                                        extended_analysis: summary,
                                        historical_data: {
                                            total_records: extendedData.data.length,
                                            sample_recent_data: extendedData.data.slice(-30), // Últimos 30 períodos como muestra
                                            // Para datos completos, usar: full_data: extendedData.data
                                        },
                                    }, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_technical_analysis': {
                        const { symbol, interval = '1d', periods = 200, output_mode = 'summary' } = args as {
                            symbol: string;
                            interval?: '1h' | '4h' | '1d' | '1w' | '1M';
                            periods?: number;
                            output_mode?: 'summary' | 'full_data';
                        };

                        // Validar y ajustar parámetros
                        const validPeriods = Math.min(Math.max(periods, 200), 500);

                        // Obtener datos históricos para análisis técnico
                        const historicalData = await this.binanceClient.getHistoricalData(
                            symbol,
                            interval,
                            validPeriods
                        );

                        // Convertir datos al formato requerido por TechnicalIndicators
                        const candles: PriceData[] = historicalData.map(kline => ({
                            close: parseFloat(kline[4]),  // precio de cierre
                            high: parseFloat(kline[2]),   // precio máximo
                            low: parseFloat(kline[3]),    // precio mínimo
                            volume: parseFloat(kline[5])  // volumen
                        }));

                        // Crear instancia del motor de análisis técnico
                        const technicalAnalysis = TechnicalAnalysisEngine.performCompleteAnalysis(candles, symbol, output_mode);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(technicalAnalysis, null, 2),
                                },
                            ],
                        };
                    }

                    case 'get_indicator_values': {
                        const { symbol, interval = '1d', indicators, periods = 200 } = args as {
                            symbol: string;
                            interval?: '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
                            indicators: string[];
                            periods?: number;
                        };

                        // Validar y ajustar parámetros
                        const validPeriods = Math.min(Math.max(periods, 200), 500);

                        // Obtener datos históricos para análisis técnico
                        const historicalData = await this.binanceClient.getHistoricalData(
                            symbol,
                            interval,
                            validPeriods
                        );

                        // Convertir datos al formato requerido por TechnicalIndicators
                        const candles: PriceData[] = historicalData.map(kline => ({
                            close: parseFloat(kline[4]),  // precio de cierre
                            high: parseFloat(kline[2]),   // precio máximo
                            low: parseFloat(kline[3]),    // precio mínimo
                            volume: parseFloat(kline[5])  // volumen
                        }));

                        const indicatorInstances = IndicatorFactory.createMany(indicators);
                        const results: { [key: string]: any[] } = {};

                        indicatorInstances.forEach((instance, index) => {
                            results[indicators[index]] = instance.calculate(candles);
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(results, null, 2),
                                },
                            ],
                        };
                    }

                    default:
                        throw new Error(`Herramienta desconocida: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                        }
                    ],
                    isError: true,
                };
            }
        });
    }

    private analyzeMarketCycles(data: any[]): any {
        if (data.length < 100) return { note: "Datos insuficientes para análisis de ciclos" };

        const prices = data.map(d => d.close);
        const highs: number[] = [];
        const lows: number[] = [];

        // Encontrar máximos y mínimos locales
        for (let i = 20; i < prices.length - 20; i++) {
            const current = prices[i];
            const prevWindow = prices.slice(i - 20, i);
            const nextWindow = prices.slice(i + 1, i + 21);

            if (current > Math.max(...prevWindow) && current > Math.max(...nextWindow)) {
                highs.push(current);
            }
            if (current < Math.min(...prevWindow) && current < Math.min(...nextWindow)) {
                lows.push(current);
            }
        }

        const avgHigh = highs.reduce((a, b) => a + b, 0) / highs.length || 0;
        const avgLow = lows.reduce((a, b) => a + b, 0) / lows.length || 0;
        const currentPrice = prices[prices.length - 1];

        return {
            cycle_highs_found: highs.length,
            cycle_lows_found: lows.length,
            average_cycle_high: `${avgHigh.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            average_cycle_low: `${avgLow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
            current_position: currentPrice > avgHigh ? "Above average highs" :
                currentPrice < avgLow ? "Below average lows" : "In normal range",
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Binance Crypto MCP Server ejecutándose en stdio');
    }
}

// Ejecutar el servidor
const server = new BinanceMCPServer();
server.run().catch((error) => {
    console.error('Error al ejecutar el servidor:', error);
    process.exit(1);
});
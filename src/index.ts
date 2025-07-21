import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool
} from '@modelcontextprotocol/sdk/types.js';
import { BinanceClient } from './helpers/binance-client';

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
                                        price: `$${parseFloat(priceData.price).toLocaleString('en-US', {
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
                                        current_price: `$${currentPrice.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        price_change_24h: `${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(4)}`,
                                        price_change_percent_24h: `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`,
                                        high_24h: `$${parseFloat(ticker.highPrice).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        low_24h: `$${parseFloat(ticker.lowPrice).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 8
                                        })}`,
                                        volume_24h: `${volume24h.toLocaleString('en-US')} ${ticker.symbol.replace('USDT', '').replace('BUSD', '')}`,
                                        quote_volume_24h: `$${quoteVolume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                                        open_price: `$${parseFloat(ticker.openPrice).toLocaleString('en-US', {
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
                                            price: `$${parseFloat(crypto.lastPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                            price_change_24h: `${parseFloat(crypto.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(crypto.priceChangePercent).toFixed(2)}%`,
                                            volume_24h_usdt: `$${parseFloat(crypto.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                                            high_24h: `$${parseFloat(crypto.highPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                            low_24h: `$${parseFloat(crypto.lowPrice).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 8
                                            })}`,
                                        })),
                                    }, null, 2),
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
                        },
                    ],
                    isError: true,
                };
            }
        });
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
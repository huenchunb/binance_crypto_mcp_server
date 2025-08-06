import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Esquemas de validación con Zod
const TickerSchema = z.object({
    symbol: z.string(),
    priceChange: z.string(),
    priceChangePercent: z.string(),
    weightedAvgPrice: z.string(),
    prevClosePrice: z.string(),
    lastPrice: z.string(),
    lastQty: z.string(),
    bidPrice: z.string(),
    askPrice: z.string(),
    openPrice: z.string(),
    highPrice: z.string(),
    lowPrice: z.string(),
    volume: z.string(),
    quoteVolume: z.string(),
    openTime: z.number(),
    closeTime: z.number(),
    firstId: z.number(),
    lastId: z.number(),
    count: z.number(),
});

const PriceSchema = z.object({
    symbol: z.string(),
    price: z.string(),
});

const ExchangeInfoSymbolSchema = z.object({
    symbol: z.string(),
    status: z.string(),
    baseAsset: z.string(),
    baseAssetPrecision: z.number(),
    quoteAsset: z.string(),
    quotePrecision: z.number(),
    baseCommissionPrecision: z.number(),
    quoteCommissionPrecision: z.number(),
    orderTypes: z.array(z.string()),
    icebergAllowed: z.boolean(),
    ocoAllowed: z.boolean(),
    isSpotTradingAllowed: z.boolean(),
    isMarginTradingAllowed: z.boolean(),
});

const ExchangeInfoSchema = z.object({
    timezone: z.string(),
    serverTime: z.number(),
    symbols: z.array(ExchangeInfoSymbolSchema),
});

const KlineSchema = z.tuple([
    z.number(), // 0: Tiempo de apertura
    z.string(), // 1: Precio de apertura
    z.string(), // 2: Precio máximo
    z.string(), // 3: Precio mínimo
    z.string(), // 4: Precio de cierre
    z.string(), // 5: Volumen
    z.number(), // 6: Tiempo de cierre
    z.string(), // 7: Volumen de cotización
    z.number(), // 8: Número de trades
    z.string(), // 9: Volumen de compra del taker
    z.string(), // 10: Volumen de cotización de compra del taker
    z.string(), // 11: Ignorar
]);

export type Ticker24hr = z.infer<typeof TickerSchema>;
export type PriceData = z.infer<typeof PriceSchema>;
export type ExchangeInfo = z.infer<typeof ExchangeInfoSchema>;
export type SymbolInfo = z.infer<typeof ExchangeInfoSymbolSchema>;
export type KlineData = z.infer<typeof KlineSchema>;

export interface ProcessedKlineData {
    timestamp: number;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quoteVolume: number;
    trades: number;
    change: number;
    changePercent: number;
}

export interface HistoricalDataSummary {
    symbol: string;
    interval: string;
    totalPeriods: number;
    dateRange: {
        start: string;
        end: string;
    };
    priceStats: {
        allTimeHigh: number;
        allTimeLow: number;
        currentPrice: number;
        totalReturn: number;
        totalReturnPercent: number;
    };
    volatilityStats: {
        averageDailyChange: number;
        volatility: number;
        maxGain: number;
        maxLoss: number;
    };
    data: ProcessedKlineData[];
}

export class BinanceClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.binance.com',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Obtiene estadísticas de 24 horas para un símbolo específico
     */
    async get24hrTicker(symbol: string): Promise<Ticker24hr> {
        try {
            const response = await this.client.get('/api/v3/ticker/24hr', {
                params: { symbol: symbol.toUpperCase() }
            });
            return TickerSchema.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                throw new Error(`Símbolo inválido: ${symbol}`);
            }
            throw new Error(`Error al obtener datos de 24hr: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Obtiene el precio actual de un símbolo
     */
    async getPrice(symbol: string): Promise<PriceData> {
        try {
            const response = await this.client.get('/api/v3/ticker/price', {
                params: { symbol: symbol.toUpperCase() }
            });
            return PriceSchema.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                throw new Error(`Símbolo inválido: ${symbol}`);
            }
            throw new Error(`Error al obtener precio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Obtiene información del exchange y símbolos disponibles
     */
    async getExchangeInfo(): Promise<ExchangeInfo> {
        try {
            const response = await this.client.get('/api/v3/exchangeInfo');
            return ExchangeInfoSchema.parse(response.data);
        } catch (error) {
            throw new Error(`Error al obtener información del exchange: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Busca símbolos que contengan el texto especificado
     */
    async searchSymbols(query: string): Promise<SymbolInfo[]> {
        const exchangeInfo = await this.getExchangeInfo();
        const searchQuery = query.toUpperCase();

        return exchangeInfo.symbols.filter(symbol =>
            symbol.symbol.includes(searchQuery) ||
            symbol.baseAsset.includes(searchQuery) ||
            symbol.quoteAsset.includes(searchQuery)
        ).slice(0, 20); // Limitar a 20 resultados
    }

    /**
     * Obtiene los top symbols por volumen
     */
    async getTopSymbolsByVolume(limit: number = 10): Promise<Ticker24hr[]> {
        try {
            const response = await this.client.get('/api/v3/ticker/24hr');
            const tickers = z.array(TickerSchema).parse(response.data);

            return tickers
                .filter(ticker => ticker.symbol.endsWith('USDT'))
                .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                .slice(0, limit);
        } catch (error) {
            throw new Error(`Error al obtener top símbolos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
   * Obtiene datos históricos de klines (velas) para análisis
   */
    async getHistoricalData(
        symbol: string,
        interval: '30m' | '1h' | '4h' | '1d' | '1w' | '1M',
        limit: number = 1000
    ): Promise<KlineData[]> {
        try {
            const response = await this.client.get('/api/v3/klines', {
                params: {
                    symbol: symbol.toUpperCase(),
                    interval,
                    limit: Math.min(limit, 1000) // Binance limita a 1000 por request
                }
            });

            return z.array(KlineSchema).parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                throw new Error(`Símbolo inválido o parámetros incorrectos: ${symbol}`);
            }
            throw new Error(`Error al obtener datos históricos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
   * Obtiene datos históricos extendidos (hasta 4+ años) dividiendo en múltiples requests
   */
    async getExtendedHistoricalData(
        symbol: string,
        interval: '1d' | '1w' | '1M' = '1d',
        yearsBack: number = 4
    ): Promise<HistoricalDataSummary> {
        try {
            const now = Date.now();
            const msPerYear = 365 * 24 * 60 * 60 * 1000;
            const startTime = now - (yearsBack * msPerYear);

            // Calcular cuántos requests necesitamos
            const intervalMs = this.getIntervalMs(interval);
            const totalPeriods = Math.floor((now - startTime) / intervalMs);
            const requestsNeeded = Math.ceil(totalPeriods / 1000);

            let allKlines: KlineData[] = [];

            // Hacer múltiples requests para obtener datos históricos extensos
            for (let i = 0; i < requestsNeeded; i++) {
                const endTime = now - (i * 1000 * intervalMs);
                const requestStartTime = endTime - (1000 * intervalMs);

                if (requestStartTime < startTime) break;

                try {
                    const response = await this.client.get('/api/v3/klines', {
                        params: {
                            symbol: symbol.toUpperCase(),
                            interval,
                            startTime: Math.max(requestStartTime, startTime),
                            endTime: endTime,
                            limit: 1000
                        }
                    });

                    const klines = z.array(KlineSchema).parse(response.data);
                    allKlines = [...klines, ...allKlines];

                    // Pequeña pausa para no sobrecargar la API
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (requestError) {
                    console.error(`Error en request ${i + 1}:`, requestError);
                    break;
                }
            }

            // Procesar y analizar los datos
            return this.processHistoricalData(allKlines, symbol, interval);

        } catch (error) {
            throw new Error(`Error al obtener datos históricos extendidos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    private getIntervalMs(interval: '1d' | '1w' | '1M'): number {
        switch (interval) {
            case '1d': return 24 * 60 * 60 * 1000; // 1 día
            case '1w': return 7 * 24 * 60 * 60 * 1000; // 1 semana
            case '1M': return 30 * 24 * 60 * 60 * 1000; // ~1 mes (aproximado)
            default: return 24 * 60 * 60 * 1000;
        }
    }

    /**
   * Procesa los datos de klines y genera estadísticas
   */
    private processHistoricalData(
        klines: KlineData[],
        symbol: string,
        interval: string
    ): HistoricalDataSummary {
        if (klines.length === 0) {
            throw new Error('No se encontraron datos históricos');
        }

        klines.sort((a, b) => a[0] - b[0]);

        const processedData: ProcessedKlineData[] = klines.map((kline, index) => {
            const open = parseFloat(kline[1]);
            const high = parseFloat(kline[2]);
            const low = parseFloat(kline[3]);
            const close = parseFloat(kline[4]);
            const volume = parseFloat(kline[5]);
            const quoteVolume = parseFloat(kline[7]);
            const trades = kline[8];

            const change = close - open;
            const changePercent = (change / open) * 100;

            return {
                timestamp: kline[0],
                date: new Date(kline[0]).toISOString().split('T')[0],
                open,
                high,
                low,
                close,
                volume,
                quoteVolume,
                trades,
                change,
                changePercent
            };
        });

        const prices = processedData.map(d => d.close);
        const changes = processedData.map(d => d.changePercent);

        const allTimeHigh = Math.max(...prices);
        const allTimeLow = Math.min(...prices);
        const currentPrice = prices[prices.length - 1];
        const firstPrice = prices[0];

        const totalReturn = currentPrice - firstPrice;
        const totalReturnPercent = (totalReturn / firstPrice) * 100;

        const averageDailyChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - averageDailyChange, 2), 0) / changes.length);
        const maxGain = Math.max(...changes);
        const maxLoss = Math.min(...changes);

        return {
            symbol,
            interval,
            totalPeriods: processedData.length,
            dateRange: {
                start: processedData[0].date,
                end: processedData[processedData.length - 1].date
            },
            priceStats: {
                allTimeHigh,
                allTimeLow,
                currentPrice,
                totalReturn,
                totalReturnPercent
            },
            volatilityStats: {
                averageDailyChange,
                volatility,
                maxGain,
                maxLoss
            },
            data: processedData
        };
    }
}
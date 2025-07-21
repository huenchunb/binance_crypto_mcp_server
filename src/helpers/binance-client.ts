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

export type Ticker24hr = z.infer<typeof TickerSchema>;
export type PriceData = z.infer<typeof PriceSchema>;
export type ExchangeInfo = z.infer<typeof ExchangeInfoSchema>;
export type SymbolInfo = z.infer<typeof ExchangeInfoSymbolSchema>;

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
}
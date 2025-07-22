/**
 * Biblioteca de Indicadores Técnicos para Análisis de Criptomonedas
 * 
 * Esta biblioteca implementa los indicadores técnicos más utilizados en el análisis
 * de criptomonedas, optimizados para la volatilidad característica de estos mercados.
 */

export interface PriceData {
    close: number;
    high: number;
    low: number;
    volume?: number;
}

export interface RSIResult {
    rsi: number;
    signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface MACDResult {
    macd: number;           // Línea MACD
    signal: number;         // Línea señal
    histogram: number;      // Histograma
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    crossover: 'BULLISH_CROSSOVER' | 'BEARISH_CROSSOVER' | 'NONE';
}

export interface MovingAverageResult {
    sma: number;
    ema: number;
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
    position: 'ABOVE' | 'BELOW' | 'AT_MA';
}

export interface TechnicalAnalysisResult {
    symbol: string;
    timestamp: string;
    currentPrice: number;
    rsi: RSIResult;
    macd: MACDResult;
    movingAverages: {
        ma20: MovingAverageResult;
        ma50: MovingAverageResult;
        ma200: MovingAverageResult;
    };
    overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    confidence: number; // 0-100
}

export class TechnicalIndicators {
    
    /**
     * Calcula el RSI (Relative Strength Index)
     * 
     * El RSI es un oscilador de momentum que mide la velocidad y magnitud
     * de los cambios de precio. Valores típicos:
     * - RSI > 70: Zona de sobrecompra (posible corrección bajista)
     * - RSI < 30: Zona de sobreventa (posible rebote alcista)
     * - RSI 50: Línea neutral (equilibrio entre compradores y vendedores)
     * 
     * @param prices Array de precios de cierre
     * @param period Período para el cálculo (típicamente 14)
     * @returns Objeto RSIResult con valor y señales interpretadas
     */
    static calculateRSI(prices: number[], period: number = 14): RSIResult {
        if (prices.length < period + 1) {
            throw new Error(`Necesitas al menos ${period + 1} precios para calcular RSI`);
        }

        // Calcular los cambios de precio (gains y losses)
        const changes: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        // Separar ganancias y pérdidas
        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

        // Calcular promedios iniciales (SMA para los primeros 14 períodos)
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        // Calcular promedios suavizados (tipo Wilder) para períodos posteriores
        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        }

        // Calcular RS y RSI
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        // Interpretar las señales
        let signal: RSIResult['signal'];
        let strength: RSIResult['strength'];

        if (rsi >= 70) {
            signal = 'OVERBOUGHT';
            strength = rsi >= 80 ? 'STRONG' : 'MODERATE';
        } else if (rsi <= 30) {
            signal = 'OVERSOLD';
            strength = rsi <= 20 ? 'STRONG' : 'MODERATE';
        } else {
            signal = 'NEUTRAL';
            strength = 'WEAK';
        }

        return { rsi, signal, strength };
    }

    /**
     * Calcula el MACD (Moving Average Convergence Divergence)
     * 
     * El MACD está compuesto por:
     * - Línea MACD: EMA(12) - EMA(26)
     * - Línea Señal: EMA(9) de la línea MACD
     * - Histograma: MACD - Señal
     * 
     * Señales principales:
     * - Cruce alcista: MACD cruza por encima de la línea señal
     * - Cruce bajista: MACD cruza por debajo de la línea señal
     * - Divergencias: El precio y el MACD se mueven en direcciones opuestas
     * 
     * @param prices Array de precios de cierre
     * @param fastPeriod Período EMA rápida (típicamente 12)
     * @param slowPeriod Período EMA lenta (típicamente 26)
     * @param signalPeriod Período EMA señal (típicamente 9)
     * @returns Objeto MACDResult con valores y señales interpretadas
     */
    static calculateMACD(
        prices: number[], 
        fastPeriod: number = 12, 
        slowPeriod: number = 26, 
        signalPeriod: number = 9
    ): MACDResult {
        if (prices.length < slowPeriod + signalPeriod) {
            throw new Error(`Necesitas al menos ${slowPeriod + signalPeriod} precios para calcular MACD`);
        }

        // Calcular EMAs rápida y lenta
        const emaFast = this.calculateEMA(prices, fastPeriod);
        const emaSlow = this.calculateEMA(prices, slowPeriod);

        // CORRECCIÓN: Alinear correctamente las EMAs para el cálculo del MACD
        // La EMA lenta determina cuándo podemos empezar a calcular MACD
        const macdLine: number[] = [];
        
        // Calcular cuántos valores podemos alinear
        const alignedLength = Math.min(emaFast.length, emaSlow.length);
        
        // EMA rápida empieza en índice (fastPeriod-1), lenta en (slowPeriod-1)
        // Necesitamos alinear desde el punto donde ambas están disponibles
        const fastStartOffset = slowPeriod - fastPeriod; // 26-12 = 14
        
        for (let i = 0; i < emaSlow.length; i++) {
            const fastIndex = i + fastStartOffset;
            if (fastIndex >= 0 && fastIndex < emaFast.length) {
                macdLine.push(emaFast[fastIndex] - emaSlow[i]);
            }
        }

        // Calcular línea señal (EMA del MACD)
        if (macdLine.length < signalPeriod) {
            throw new Error(`Línea MACD tiene solo ${macdLine.length} valores, necesita al menos ${signalPeriod} para calcular señal`);
        }
        
        const signalLine = this.calculateEMA(macdLine, signalPeriod);

        // Tomar los valores más recientes (asegurándonos de que existen)
        const macd = macdLine.length > 0 ? macdLine[macdLine.length - 1] : 0;
        const signal = signalLine.length > 0 ? signalLine[signalLine.length - 1] : 0;
        const histogram = macd - signal;

        // Determinar tendencia y cruces
        let trend: MACDResult['trend'];
        let crossover: MACDResult['crossover'] = 'NONE';

        // Analizar tendencia basada en posición del MACD respecto a cero
        if (macd > 0) {
            trend = 'BULLISH';
        } else if (macd < 0) {
            trend = 'BEARISH';
        } else {
            trend = 'NEUTRAL';
        }

        // Detectar cruces si tenemos suficientes datos
        if (macdLine.length >= 2 && signalLine.length >= 2) {
            const prevMacd = macdLine[macdLine.length - 2];
            const prevSignal = signalLine[signalLine.length - 2];

            // Cruce alcista: MACD cruza por encima de la señal
            if (prevMacd <= prevSignal && macd > signal) {
                crossover = 'BULLISH_CROSSOVER';
            }
            // Cruce bajista: MACD cruza por debajo de la señal
            else if (prevMacd >= prevSignal && macd < signal) {
                crossover = 'BEARISH_CROSSOVER';
            }
        }

        return { macd, signal, histogram, trend, crossover };
    }

    /**
     * Calcula medias móviles simples y exponenciales
     * 
     * SMA: Promedio aritmético simple - da igual peso a todos los valores
     * EMA: Media exponencial - da más peso a valores recientes
     * 
     * En criptomonedas, la EMA es preferida porque:
     * - Reacciona más rápido a cambios de precio
     * - Se adapta mejor a la alta volatilidad
     * - Es más sensible a movimientos recientes del mercado
     * 
     * @param prices Array de precios de cierre
     * @param period Período de la media móvil
     * @returns Objeto MovingAverageResult con SMA, EMA y análisis de tendencia
     */
    static calculateMovingAverages(prices: number[], period: number): MovingAverageResult {
        if (prices.length < period) {
            throw new Error(`Necesitas al menos ${period} precios para calcular medias móviles`);
        }

        // Calcular SMA (Simple Moving Average)
        const smaValues = this.calculateSMA(prices, period);
        const sma = smaValues[smaValues.length - 1];

        // Calcular EMA (Exponential Moving Average)
        const emaValues = this.calculateEMA(prices, period);
        const ema = emaValues[emaValues.length - 1];

        const currentPrice = prices[prices.length - 1];

        // Determinar posición del precio respecto a las medias
        let position: MovingAverageResult['position'];
        const tolerance = currentPrice * 0.001; // 0.1% de tolerancia

        if (currentPrice > ema + tolerance) {
            position = 'ABOVE';
        } else if (currentPrice < ema - tolerance) {
            position = 'BELOW';
        } else {
            position = 'AT_MA';
        }

        // Analizar tendencia basada en la pendiente de la EMA
        let trend: MovingAverageResult['trend'];
        
        if (emaValues.length >= 5) {
            const recentEma = emaValues.slice(-5); // Últimos 5 valores de EMA
            const slope = (recentEma[4] - recentEma[0]) / 4; // Pendiente aproximada
            const slopePercent = (slope / recentEma[0]) * 100;

            if (slopePercent > 0.1) { // Pendiente positiva > 0.1%
                trend = 'UPTREND';
            } else if (slopePercent < -0.1) { // Pendiente negativa < -0.1%
                trend = 'DOWNTREND';
            } else {
                trend = 'SIDEWAYS';
            }
        } else {
            trend = 'SIDEWAYS';
        }

        return { sma, ema, trend, position };
    }

    /**
     * Realiza un análisis técnico completo combinando todos los indicadores
     * 
     * Este método integra RSI, MACD y medias móviles para generar una señal
     * global de trading. El algoritmo pondera cada indicador según su 
     * confiabilidad en diferentes condiciones de mercado.
     * 
     * @param priceData Array de datos de precio (OHLC)
     * @param symbol Símbolo de la criptomoneda
     * @returns Análisis técnico completo con señal global
     */
    static performCompleteAnalysis(priceData: PriceData[], symbol: string): TechnicalAnalysisResult {
        if (priceData.length < 200) {
            throw new Error('Necesitas al menos 200 períodos para análisis técnico completo');
        }

        const closes = priceData.map(d => d.close);
        const currentPrice = closes[closes.length - 1];

        // Calcular indicadores
        const rsi = this.calculateRSI(closes);
        const macd = this.calculateMACD(closes);
        
        // Calcular medias móviles múltiples
        const ma20 = this.calculateMovingAverages(closes, 20);
        const ma50 = this.calculateMovingAverages(closes, 50);
        const ma200 = this.calculateMovingAverages(closes, 200);

        // Sistema de puntuación para señal global
        let score = 0;
        let maxScore = 0;

        // RSI (peso: 2)
        maxScore += 2;
        if (rsi.signal === 'OVERSOLD') {
            score += rsi.strength === 'STRONG' ? 2 : 1;
        } else if (rsi.signal === 'OVERBOUGHT') {
            score -= rsi.strength === 'STRONG' ? 2 : 1;
        }

        // MACD (peso: 3)
        maxScore += 3;
        if (macd.crossover === 'BULLISH_CROSSOVER') {
            score += 3;
        } else if (macd.crossover === 'BEARISH_CROSSOVER') {
            score -= 3;
        } else if (macd.trend === 'BULLISH') {
            score += 1;
        } else if (macd.trend === 'BEARISH') {
            score -= 1;
        }

        // Medias móviles (peso: 3)
        maxScore += 3;
        const maSignals = [ma20, ma50, ma200];
        maSignals.forEach(ma => {
            if (ma.position === 'ABOVE' && ma.trend === 'UPTREND') {
                score += 1;
            } else if (ma.position === 'BELOW' && ma.trend === 'DOWNTREND') {
                score -= 1;
            }
        });

        // Calcular señal global y confianza
        const normalizedScore = score / maxScore; // -1 a 1
        const confidence = Math.abs(normalizedScore) * 100;

        let overallSignal: TechnicalAnalysisResult['overallSignal'];
        
        if (normalizedScore >= 0.6) {
            overallSignal = 'STRONG_BUY';
        } else if (normalizedScore >= 0.2) {
            overallSignal = 'BUY';
        } else if (normalizedScore <= -0.6) {
            overallSignal = 'STRONG_SELL';
        } else if (normalizedScore <= -0.2) {
            overallSignal = 'SELL';
        } else {
            overallSignal = 'NEUTRAL';
        }

        return {
            symbol,
            timestamp: new Date().toISOString(),
            currentPrice,
            rsi,
            macd,
            movingAverages: { ma20, ma50, ma200 },
            overallSignal,
            confidence: Math.round(confidence)
        };
    }

    // === Métodos auxiliares para cálculos ===

    /**
     * Calcula Simple Moving Average (SMA)
     * Promedio aritmético de los últimos N períodos
     */
    private static calculateSMA(prices: number[], period: number): number[] {
        const sma: number[] = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        
        return sma;
    }

    /**
     * Calcula Exponential Moving Average (EMA)
     * Da más peso a precios recientes usando factor de suavizado
     */
    private static calculateEMA(prices: number[], period: number): number[] {
        const ema: number[] = [];
        const multiplier = 2 / (period + 1); // Factor de suavizado

        // Primera EMA es la SMA del período inicial
        const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        ema.push(firstSMA);

        // Calcular EMAs posteriores: EMA = (precio * multiplicador) + (EMA_anterior * (1 - multiplicador))
        for (let i = period; i < prices.length; i++) {
            const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
            ema.push(currentEMA);
        }

        return ema;
    }
}
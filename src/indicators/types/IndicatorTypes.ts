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
    macd: number;
    signal: number;
    histogram: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    crossover: 'BULLISH_CROSSOVER' | 'BEARISH_CROSSOVER' | 'NONE';
}

export interface MovingAverageResult {
    sma: number;
    ema: number;
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
    position: 'ABOVE' | 'BELOW' | 'AT_MA';
}

export interface VWAPResult {
    vwap: number;
    position: 'ABOVE' | 'BELOW' | 'AT_VWAP';
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    distance_percent: number;
    volume_profile: 'HIGH_VOLUME_AREA' | 'LOW_VOLUME_AREA' | 'AVERAGE_VOLUME';
}

export interface OBVResult {
    obv: number;
    trend: 'RISING' | 'FALLING' | 'SIDEWAYS';
    divergence: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NO_DIVERGENCE';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    signal: 'BUY' | 'SELL' | 'HOLD';
}

export interface MFIResult {
    mfi: number;
    signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    divergence: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NO_DIVERGENCE';
    money_flow: 'POSITIVE' | 'NEGATIVE' | 'BALANCED';
}

export interface CMFResult {
    cmf: number;
    flow_type: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    divergence: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NO_DIVERGENCE';
    pressure: 'BUYING_PRESSURE' | 'SELLING_PRESSURE' | 'BALANCED';
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
    vwap: VWAPResult;
    obv: OBVResult;
    mfi: MFIResult;
    cmf: CMFResult;
    overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    confidence: number;
    volumeConfirmation: boolean;
}
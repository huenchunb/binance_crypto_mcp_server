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

export interface BollingerBandsResult {
    middle: number;
    upper: number;
    lower: number;
    width: number;
    percent_b: number;
    signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL' | 'SQUEEZE';
    position: 'ABOVE_UPPER' | 'BETWEEN_BANDS' | 'BELOW_LOWER' | 'AT_MIDDLE';
    volatility: 'HIGH' | 'MEDIUM' | 'LOW';
    squeeze_status: 'ENTERING_SQUEEZE' | 'IN_SQUEEZE' | 'EXITING_SQUEEZE' | 'NORMAL';
}

export interface StochasticResult {
    k_percent: number;
    d_percent: number;
    signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL';
    crossover: 'BULLISH_CROSSOVER' | 'BEARISH_CROSSOVER' | 'NONE';
    position: 'EXTREME_OVERSOLD' | 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT' | 'EXTREME_OVERBOUGHT';
    divergence: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NO_DIVERGENCE';
    momentum: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface WilliamsRResult {
    williams_r: number;
    signal: 'OVERSOLD' | 'OVERBOUGHT' | 'NEUTRAL';
    position: 'EXTREME_OVERSOLD' | 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT' | 'EXTREME_OVERBOUGHT';
    momentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reversal_signal: 'STRONG_REVERSAL' | 'WEAK_REVERSAL' | 'NO_REVERSAL';
    trend_strength: 'STRONG' | 'MODERATE' | 'WEAK';
    divergence: 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE' | 'NO_DIVERGENCE';
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
    bollingerBands: BollingerBandsResult;
    stochastic: StochasticResult;
    williamsR: WilliamsRResult;
    overallSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    confidence: number;
    volumeConfirmation: boolean;
    volatilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}
import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MACDResult } from '../types/IndicatorTypes';

export class MACDIndicator implements IndicatorStrategy<MACDResult> {
    constructor(
        private shortPeriod: number = 12,
        private longPeriod: number = 26,
        private signalPeriod: number = 9
    ) { }

    calculate(data: PriceData[]): MACDResult {
        const ema = (period: number, prices: number[]) => {
            const k = 2 / (period + 1);
            let ema = prices[0];
            for (let i = 1; i < prices.length; i++) {
                ema = prices[i] * k + ema * (1 - k);
            }
            return ema;
        };

        const closes = data.map(d => d.close);
        const shortEMA = ema(this.shortPeriod, closes.slice(-this.shortPeriod));
        const longEMA = ema(this.longPeriod, closes.slice(-this.longPeriod));
        const macd = shortEMA - longEMA;

        const histogramData = Array.from({ length: this.signalPeriod }, (_, i) =>
            ema(this.shortPeriod, closes.slice(-(this.signalPeriod + i)))
            - ema(this.longPeriod, closes.slice(-(this.signalPeriod + i)))
        );

        const signal = ema(this.signalPeriod, histogramData);
        const histogram = macd - signal;

        let trend: MACDResult["trend"] = "NEUTRAL";
        let crossover: MACDResult["crossover"] = "NONE";

        if (macd > signal) {
            trend = "BULLISH";
            crossover = histogram > 0 ? "BULLISH_CROSSOVER" : "NONE";
        } else if (macd < signal) {
            trend = "BEARISH";
            crossover = histogram < 0 ? "BEARISH_CROSSOVER" : "NONE";
        }

        return { macd, signal, histogram, trend, crossover };
    }
}
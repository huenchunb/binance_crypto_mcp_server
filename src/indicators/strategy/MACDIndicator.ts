import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MACDResult } from '../types/IndicatorTypes';

export class MACDIndicator implements IndicatorStrategy<MACDResult> {
    constructor(
        private shortPeriod: number = 12,
        private longPeriod: number = 26,
        private signalPeriod: number = 9
    ) { }

    calculate(data: PriceData[]): MACDResult[] {
        const results: MACDResult[] = [];
        const closes = data.map(d => d.close);

        const ema = (period: number, prices: number[]) => {
            const k = 2 / (period + 1);
            let emaValues = [prices[0]];
            for (let i = 1; i < prices.length; i++) {
                emaValues.push(prices[i] * k + emaValues[i - 1] * (1 - k));
            }
            return emaValues;
        };

        const shortEMAs = ema(this.shortPeriod, closes);
        const longEMAs = ema(this.longPeriod, closes);

        for (let i = this.longPeriod; i < data.length; i++) {
            const macd = shortEMAs[i] - longEMAs[i];

            const macdLine = shortEMAs.slice(i - this.signalPeriod, i + 1).map((val, index) => val - longEMAs[i - this.signalPeriod + index]);
            const signal = ema(this.signalPeriod, macdLine)[macdLine.length - 1];

            const histogram = macd - signal;

            let trend: MACDResult["trend"] = "NEUTRAL";
            let crossover: MACDResult["crossover"] = "NONE";

            if (macd > signal) {
                trend = "BULLISH";
                if (histogram > 0 && (shortEMAs[i - 1] - longEMAs[i - 1]) <= ema(this.signalPeriod, shortEMAs.slice(i - this.signalPeriod - 1, i).map((val, index) => val - longEMAs[i - this.signalPeriod - 1 + index]))[macdLine.length - 2]) {
                    crossover = "BULLISH_CROSSOVER";
                }
            } else if (macd < signal) {
                trend = "BEARISH";
                if (histogram < 0 && (shortEMAs[i - 1] - longEMAs[i - 1]) >= ema(this.signalPeriod, shortEMAs.slice(i - this.signalPeriod - 1, i).map((val, index) => val - longEMAs[i - this.signalPeriod - 1 + index]))[macdLine.length - 2]) {
                    crossover = "BEARISH_CROSSOVER";
                }
            }

            results.push({ macd, signal, histogram, trend, crossover });
        }

        return results;
    }
}
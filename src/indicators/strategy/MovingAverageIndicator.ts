import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MovingAverageResult } from '../types/IndicatorTypes';

export class MovingAverageIndicator implements IndicatorStrategy<MovingAverageResult> {
    constructor(private period: number = 20) { }

    calculate(data: PriceData[]): MovingAverageResult[] {
        const results: MovingAverageResult[] = [];

        const ema = (period: number, prices: number[]) => {
            const k = 2 / (period + 1);
            let emaValues = [prices[0]];
            for (let i = 1; i < prices.length; i++) {
                emaValues.push(prices[i] * k + emaValues[i - 1] * (1 - k));
            }
            return emaValues;
        };

        const closes = data.map(d => d.close);
        const emas = ema(this.period, closes);

        for (let i = this.period; i < data.length; i++) {
            const slice = closes.slice(i - this.period, i + 1);
            const sma = slice.reduce((acc, val) => acc + val, 0) / this.period;
            const currentEma = emas[i];
            const currentPrice = closes[i];

            const position: MovingAverageResult["position"] =
                currentPrice > currentEma ? "ABOVE" :
                    currentPrice < currentEma ? "BELOW" : "AT_MA";

            let trend: MovingAverageResult["trend"] = "SIDEWAYS";
            if (currentEma > sma) trend = "UPTREND";
            else if (currentEma < sma) trend = "DOWNTREND";

            results.push({ sma, ema: currentEma, trend, position });
        }

        return results;
    }
}
import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MovingAverageResult } from '../types/IndicatorTypes';

export class MovingAverageIndicator implements IndicatorStrategy<MovingAverageResult> {
    constructor(private period: number = 20) { }

    calculate(data: PriceData[]): MovingAverageResult {
        const closes = data.slice(-this.period).map(p => p.close);
        const sma = closes.reduce((acc, val) => acc + val, 0) / this.period;

        const ema = (() => {
            const k = 2 / (this.period + 1);
            let result = closes[0];
            for (let i = 1; i < closes.length; i++) {
                result = closes[i] * k + result * (1 - k);
            }
            return result;
        })();

        const currentPrice = data[data.length - 1].close;

        const position: MovingAverageResult["position"] =
            currentPrice > ema ? "ABOVE" :
                currentPrice < ema ? "BELOW" : "AT_MA";

        let trend: MovingAverageResult["trend"] = "SIDEWAYS";
        if (ema > sma) trend = "UPTREND";
        else if (ema < sma) trend = "DOWNTREND";

        return { sma, ema, trend, position };
    }
}
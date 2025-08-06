import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MovingAverageResult } from '../types/IndicatorTypes';
import { SMA, EMA } from 'technicalindicators';

export class MovingAverageIndicator implements IndicatorStrategy<MovingAverageResult> {
    constructor(private period: number = 20) { }

    calculate(data: PriceData[]): MovingAverageResult[] {
        const closes = data.map(d => d.close);

        const smaValues = SMA.calculate({ period: this.period, values: closes });
        const emaValues = EMA.calculate({ period: this.period, values: closes });

        return smaValues.map((sma, index) => {
            const ema = emaValues[index];
            const currentPrice = closes[closes.length - smaValues.length + index];

            const position: MovingAverageResult["position"] =
                currentPrice > ema ? "ABOVE" :
                    currentPrice < ema ? "BELOW" : "AT_MA";

            let trend: MovingAverageResult["trend"] = "SIDEWAYS";
            if (ema > sma) trend = "UPTREND";
            else if (ema < sma) trend = "DOWNTREND";

            return { sma, ema, trend, position };
        });
    }
}

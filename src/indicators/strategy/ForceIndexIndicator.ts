import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, ForceIndexResult } from '../types/IndicatorTypes';
import { ForceIndex } from 'technicalindicators';

export class ForceIndexIndicator implements IndicatorStrategy<ForceIndexResult> {
    constructor(private period: number = 1) { }

    calculate(data: PriceData[]): ForceIndexResult[] {
        const fiInput = {
            close: data.map(d => d.close),
            volume: data.map(d => d.volume || 0),
            period: this.period
        };

        const fiValues = ForceIndex.calculate(fiInput);

        return fiValues.map(fi => {
            let trend: ForceIndexResult["trend"] = "NEUTRAL";
            if (fi > 0) {
                trend = "BULLISH";
            } else if (fi < 0) {
                trend = "BEARISH";
            }

            return { fi, trend };
        });
    }
}

import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, ParabolicSARResult } from '../types/IndicatorTypes';
import { PSAR } from 'technicalindicators';

export class ParabolicSARIndicator implements IndicatorStrategy<ParabolicSARResult> {
    constructor(
        private step: number = 0.02,
        private max: number = 0.2
    ) { }

    calculate(data: PriceData[]): ParabolicSARResult[] {
        const psarInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            step: this.step,
            max: this.max
        };

        const psarValues = PSAR.calculate(psarInput);

        return psarValues.map((psar, index) => {
            const trend: ParabolicSARResult["trend"] = psar < data[index].low ? "BULLISH" : "BEARISH";
            const reversal = index > 0 && (psarValues[index - 1] < data[index - 1].low) !== (psar < data[index].low);

            return { psar, trend, reversal };
        });
    }
}

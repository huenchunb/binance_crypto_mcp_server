import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, IchimokuCloudResult } from '../types/IndicatorTypes';
import { IchimokuCloud } from 'technicalindicators';

export class IchimokuCloudIndicator implements IndicatorStrategy<IchimokuCloudResult> {
    constructor(
        private conversionPeriod: number = 9,
        private basePeriod: number = 26,
        private spanPeriod: number = 52,
        private displacement: number = 26
    ) { }

    calculate(data: PriceData[]): IchimokuCloudResult[] {
        const ichimokuInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            conversionPeriod: this.conversionPeriod,
            basePeriod: this.basePeriod,
            spanPeriod: this.spanPeriod,
            displacement: this.displacement
        };

        const ichimokuValues = IchimokuCloud.calculate(ichimokuInput);

        return ichimokuValues.map(ichimoku => {
            let signal: IchimokuCloudResult["signal"] = "NEUTRAL";
            if (ichimoku.spanA > ichimoku.spanB) {
                signal = "BULLISH";
            } else if (ichimoku.spanA < ichimoku.spanB) {
                signal = "BEARISH";
            }

            return { conversion: ichimoku.conversion, base: ichimoku.base, spanA: ichimoku.spanA, spanB: ichimoku.spanB, signal };
        });
    }
}

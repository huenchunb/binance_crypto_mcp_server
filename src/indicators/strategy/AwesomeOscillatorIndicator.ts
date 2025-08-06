import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, AwesomeOscillatorResult } from '../types/IndicatorTypes';
import { AwesomeOscillator } from 'technicalindicators';

export class AwesomeOscillatorIndicator implements IndicatorStrategy<AwesomeOscillatorResult> {
    constructor(
        private fastPeriod: number = 5,
        private slowPeriod: number = 34
    ) { }

    calculate(data: PriceData[]): AwesomeOscillatorResult[] {
        const aoInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            fastPeriod: this.fastPeriod,
            slowPeriod: this.slowPeriod
        };

        const aoValues = AwesomeOscillator.calculate(aoInput);

        return aoValues.map(ao => {
            let trend: AwesomeOscillatorResult["trend"] = "NEUTRAL";
            if (ao > 0) {
                trend = "BULLISH";
            } else if (ao < 0) {
                trend = "BEARISH";
            }

            return { ao, trend };
        });
    }
}

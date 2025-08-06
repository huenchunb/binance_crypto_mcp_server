import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, StochasticRSIResult } from '../types/IndicatorTypes';
import { StochasticRSI } from 'technicalindicators';

export class StochasticRSIIndicator implements IndicatorStrategy<StochasticRSIResult> {
    constructor(
        private rsiPeriod: number = 14,
        private stochasticPeriod: number = 14,
        private kPeriod: number = 3,
        private dPeriod: number = 3
    ) { }

    calculate(data: PriceData[]): StochasticRSIResult[] {
        const stochRsiInput = {
            values: data.map(d => d.close),
            rsiPeriod: this.rsiPeriod,
            stochasticPeriod: this.stochasticPeriod,
            kPeriod: this.kPeriod,
            dPeriod: this.dPeriod
        };

        const stochRsiValues = StochasticRSI.calculate(stochRsiInput);

        return stochRsiValues.map(stochRsi => {
            let signal: StochasticRSIResult["signal"] = "NEUTRAL";
            if (stochRsi.stochRSI > 80) {
                signal = "OVERBOUGHT";
            } else if (stochRsi.stochRSI < 20) {
                signal = "OVERSOLD";
            }

            return { ...stochRsi, signal };
        });
    }
}

import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MACDResult } from '../types/IndicatorTypes';
import { MACD } from 'technicalindicators';
import { MACDInput } from 'technicalindicators/declarations/moving_averages/MACD';

export class MACDIndicator implements IndicatorStrategy<MACDResult> {
    constructor(
        private shortPeriod: number = 12,
        private longPeriod: number = 26,
        private signalPeriod: number = 9
    ) { }

    calculate(data: PriceData[]): MACDResult[] {
        const macdInput: MACDInput = {
            values: data.map(d => d.close),
            fastPeriod: this.shortPeriod,
            slowPeriod: this.longPeriod,
            signalPeriod: this.signalPeriod,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        };

        const macdValues = MACD.calculate(macdInput);

        return macdValues.map(macd => {
            let trend: MACDResult["trend"] = "NEUTRAL";
            let crossover: MACDResult["crossover"] = "NONE";

            if (macd.MACD && macd.signal && macd.MACD > macd.signal) {
                trend = "BULLISH";
                if (macd.histogram && macd.histogram > 0) {
                    crossover = "BULLISH_CROSSOVER";
                }
            } else if (macd.MACD && macd.signal && macd.MACD < macd.signal) {
                trend = "BEARISH";
                if (macd.histogram && macd.histogram < 0) {
                    crossover = "BEARISH_CROSSOVER";
                }
            }

            return { macd: macd.MACD || 0, signal: macd.signal || 0, histogram: macd.histogram || 0, trend, crossover };
        });
    }
}
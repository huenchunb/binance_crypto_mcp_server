import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, KeltnerChannelResult } from '../types/IndicatorTypes';
import { KeltnerChannels } from 'technicalindicators';

export class KeltnerChannelIndicator implements IndicatorStrategy<KeltnerChannelResult> {
    constructor(
        private period: number = 20,
        private multiplier: number = 2,
        private atrPeriod: number = 10
    ) { }

    calculate(data: PriceData[]): KeltnerChannelResult[] {
        const kcInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            period: this.period,
            multiplier: this.multiplier,
            atrPeriod: this.atrPeriod,
            maPeriod: this.period, // Added maPeriod
            useSMA: true // Added useSMA
        };

        const kcValues = KeltnerChannels.calculate(kcInput);

        return kcValues.map(kc => {
            let signal: KeltnerChannelResult["signal"] = "NEUTRAL";
            const currentPrice = data[data.length - kcValues.length].close;

            if (currentPrice > kc.upper) {
                signal = "OVERBOUGHT";
            } else if (currentPrice < kc.lower) {
                signal = "OVERSOLD";
            }

            return { ...kc, signal };
        });
    }
}
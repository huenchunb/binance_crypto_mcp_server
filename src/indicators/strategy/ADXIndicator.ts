import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, ADXResult } from '../types/IndicatorTypes';
import { ADX } from 'technicalindicators';

export class ADXIndicator implements IndicatorStrategy<ADXResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): ADXResult[] {
        const adxInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            period: this.period
        };

        const adxValues = ADX.calculate(adxInput);

        return adxValues.map(adx => {
            let trend: ADXResult["trend"] = "NO_TREND";
            if (adx.adx > 25) {
                if (adx.pdi > adx.mdi) {
                    trend = "STRONG";
                } else {
                    trend = "WEAK";
                }
            }

            return { adx: adx.adx, pdi: adx.pdi, mdi: adx.mdi, trend };
        });
    }
}

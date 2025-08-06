import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, ATRResult } from '../types/IndicatorTypes';
import { ATR } from 'technicalindicators';

export class ATRIndicator implements IndicatorStrategy<ATRResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): ATRResult[] {
        const atrInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            period: this.period
        };

        const atrValues = ATR.calculate(atrInput);
        
        return atrValues.map(value => {
            let signal: ATRResult["signal"] = "NEUTRAL";
            if (value > 0) { // Simplified signal logic
                signal = "HIGH_VOLATILITY";
            } else {
                signal = "LOW_VOLATILITY";
            }
            return { atr: value, signal };
        });
    }
}

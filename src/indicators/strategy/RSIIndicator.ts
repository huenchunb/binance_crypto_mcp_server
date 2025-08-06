import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, RSIResult } from '../types/IndicatorTypes';
import { RSI } from 'technicalindicators';
import { RSIInput } from 'technicalindicators/declarations/oscillators/RSI';

export class RSIIndicator implements IndicatorStrategy<RSIResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): RSIResult[] {
        const rsiInput: RSIInput = {
            values: data.map(d => d.close),
            period: this.period
        };

        const rsiValues = RSI.calculate(rsiInput);

        return rsiValues.map(rsi => {
            let signal: RSIResult["signal"] = "NEUTRAL";
            let strength: RSIResult["strength"] = "MODERATE";

            if (rsi > 70) signal = "OVERBOUGHT";
            else if (rsi < 30) signal = "OVERSOLD";

            if (rsi > 80 || rsi < 20) strength = "STRONG";
            else if ((rsi >= 70 && rsi <= 80) || (rsi >= 20 && rsi <= 30)) strength = "MODERATE";
            else strength = "WEAK";

            return { rsi, signal, strength };
        });
    }
}

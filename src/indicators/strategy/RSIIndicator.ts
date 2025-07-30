import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, RSIResult } from '../types/IndicatorTypes';

export class RSIIndicator implements IndicatorStrategy<RSIResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): RSIResult[] {
        const results: RSIResult[] = [];

        for (let i = this.period; i < data.length; i++) {
            const slice = data.slice(i - this.period, i + 1);
            let gains = 0;
            let losses = 0;

            for (let j = 1; j < slice.length; j++) {
                const diff = slice[j].close - slice[j - 1].close;
                if (diff >= 0) {
                    gains += diff;
                } else {
                    losses -= diff;
                }
            }

            const avgGain = gains / this.period;
            const avgLoss = losses / this.period;

            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));

            let signal: RSIResult["signal"] = "NEUTRAL";
            let strength: RSIResult["strength"] = "MODERATE";

            if (rsi > 70) signal = "OVERBOUGHT";
            else if (rsi < 30) signal = "OVERSOLD";

            if (rsi > 80 || rsi < 20) strength = "STRONG";
            else if ((rsi >= 70 && rsi <= 80) || (rsi >= 20 && rsi <= 30)) strength = "MODERATE";
            else strength = "WEAK";

            results.push({ rsi, signal, strength });
        }

        return results;
    }
}
import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MFIResult } from '../types/IndicatorTypes';

export class MFIIndicator implements IndicatorStrategy<MFIResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): MFIResult[] {
        const results: MFIResult[] = [];

        for (let i = this.period; i < data.length; i++) {
            const slice = data.slice(i - this.period, i + 1);
            let positiveFlow = 0;
            let negativeFlow = 0;

            for (let j = 1; j < slice.length; j++) {
                const curr = slice[j];
                const prev = slice[j - 1];
                const tp = (curr.high + curr.low + curr.close) / 3;
                const prevTp = (prev.high + prev.low + prev.close) / 3;

                if (tp > prevTp) positiveFlow += tp * (curr.volume || 0);
                else if (tp < prevTp) negativeFlow += tp * (curr.volume || 0);
            }

            const moneyFlowRatio = positiveFlow / (negativeFlow || 1);
            const mfi = 100 - (100 / (1 + moneyFlowRatio));

            let signal: MFIResult["signal"] = "NEUTRAL";
            if (mfi > 80) signal = "OVERBOUGHT";
            else if (mfi < 20) signal = "OVERSOLD";

            let strength: MFIResult["strength"] = "WEAK";
            if (mfi > 90 || mfi < 10) strength = "STRONG";
            else if (mfi > 80 || mfi < 20) strength = "MODERATE";

            results.push({
                mfi,
                signal,
                strength,
                divergence: "NO_DIVERGENCE",
                money_flow: positiveFlow > negativeFlow ? "POSITIVE" :
                    positiveFlow < negativeFlow ? "NEGATIVE" : "BALANCED"
            });
        }

        return results;
    }
}
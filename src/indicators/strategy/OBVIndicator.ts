import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, OBVResult } from '../types/IndicatorTypes';

export class OBVIndicator implements IndicatorStrategy<OBVResult> {
    calculate(data: PriceData[]): OBVResult[] {
        const results: OBVResult[] = [];
        let obv = 0;

        for (let i = 1; i < data.length; i++) {
            const current = data[i];
            const prev = data[i - 1];
            if (current.close > prev.close) {
                obv += current.volume || 0;
            } else if (current.close < prev.close) {
                obv -= current.volume || 0;
            }

            const trend = obv > (results[results.length - 1]?.obv || 0) ? "RISING" : obv < (results[results.length - 1]?.obv || 0) ? "FALLING" : "SIDEWAYS";
            const signal = trend === "RISING" ? "BUY" : trend === "FALLING" ? "SELL" : "HOLD";
            const strength = Math.abs(obv) > 100000 ? "STRONG" : Math.abs(obv) > 50000 ? "MODERATE" : "WEAK";
            const divergence: OBVResult["divergence"] = "NO_DIVERGENCE"; // Placeholder

            results.push({ obv, trend, signal, strength, divergence });
        }

        return results;
    }
}
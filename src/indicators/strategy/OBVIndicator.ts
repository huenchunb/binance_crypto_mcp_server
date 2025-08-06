import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, OBVResult } from '../types/IndicatorTypes';
import { OBV } from 'technicalindicators';
import { OBVInput } from 'technicalindicators/declarations/volume/OBV';

export class OBVIndicator implements IndicatorStrategy<OBVResult> {
    calculate(data: PriceData[]): OBVResult[] {
        const obvInput: OBVInput = {
            close: data.map(d => d.close),
            volume: data.map(d => d.volume || 0)
        };

        const obvValues = OBV.calculate(obvInput);

        return obvValues.map((obv, index) => {
            const trend = obv > (obvValues[index - 1] || 0) ? "RISING" : obv < (obvValues[index - 1] || 0) ? "FALLING" : "SIDEWAYS";
            const signal = trend === "RISING" ? "BUY" : trend === "FALLING" ? "SELL" : "HOLD";
            const strength = Math.abs(obv) > 100000 ? "STRONG" : Math.abs(obv) > 50000 ? "MODERATE" : "WEAK";
            const divergence: OBVResult["divergence"] = "NO_DIVERGENCE"; // Placeholder

            return { obv, trend, signal, strength, divergence };
        });
    }
}

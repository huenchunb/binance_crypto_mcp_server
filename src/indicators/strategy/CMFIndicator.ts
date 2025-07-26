import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, CMFResult } from '../types/IndicatorTypes';

export class CMFIndicator implements IndicatorStrategy<CMFResult> {
    constructor(private period: number = 20) { }

    calculate(data: PriceData[]): CMFResult {
        let moneyFlowVolume = 0;
        let volumeSum = 0;

        for (let i = data.length - this.period; i < data.length; i++) {
            const p = data[i];
            const mfm = ((p.close - p.low) - (p.high - p.close)) / ((p.high - p.low) || 1);
            moneyFlowVolume += mfm * (p.volume || 0);
            volumeSum += p.volume || 0;
        }

        const cmf = volumeSum ? moneyFlowVolume / volumeSum : 0;

        let flow_type: CMFResult["flow_type"] = "NEUTRAL";
        if (cmf > 0.1) flow_type = "ACCUMULATION";
        else if (cmf < -0.1) flow_type = "DISTRIBUTION";

        const strength = Math.abs(cmf) > 0.2 ? "STRONG" : Math.abs(cmf) > 0.1 ? "MODERATE" : "WEAK";

        const pressure = cmf > 0.05 ? "BUYING_PRESSURE" :
            cmf < -0.05 ? "SELLING_PRESSURE" : "BALANCED";

        return {
            cmf,
            flow_type,
            strength,
            divergence: "NO_DIVERGENCE",
            pressure
        };
    }
}
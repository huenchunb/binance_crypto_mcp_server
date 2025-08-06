import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, MFIResult } from '../types/IndicatorTypes';
import { MFI } from 'technicalindicators';
import { MFIInput } from 'technicalindicators/declarations/volume/MFI';

export class MFIIndicator implements IndicatorStrategy<MFIResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): MFIResult[] {
        const mfiInput: MFIInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            volume: data.map(d => d.volume || 0),
            period: this.period
        };

        const mfiValues = MFI.calculate(mfiInput);

        return mfiValues.map(mfi => {
            let signal: MFIResult["signal"] = "NEUTRAL";
            if (mfi > 80) signal = "OVERBOUGHT";
            else if (mfi < 20) signal = "OVERSOLD";

            let strength: MFIResult["strength"] = "WEAK";
            if (mfi > 90 || mfi < 10) strength = "STRONG";
            else if (mfi > 80 || mfi < 20) strength = "MODERATE";

            return {
                mfi,
                signal,
                strength,
                divergence: "NO_DIVERGENCE",
                money_flow: "BALANCED"
            };
        });
    }
}

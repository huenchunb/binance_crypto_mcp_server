import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, VWAPResult } from '../types/IndicatorTypes';
import { VWAP } from 'technicalindicators';
import { VWAPInput } from 'technicalindicators/declarations/volume/VWAP';

export class VWAPIndicator implements IndicatorStrategy<VWAPResult> {
    calculate(data: PriceData[]): VWAPResult[] {
        const vwapInput: VWAPInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            volume: data.map(d => d.volume || 0)
        };

        const vwapValues = VWAP.calculate(vwapInput);

        return vwapValues.map((vwap, index) => {
            const currentPrice = data[index].close;
            const distance_percent = ((currentPrice - vwap) / vwap) * 100;

            const position = currentPrice > vwap ? "ABOVE" :
                currentPrice < vwap ? "BELOW" : "AT_VWAP";

            const bias = distance_percent > 1 ? "BULLISH" :
                distance_percent < -1 ? "BEARISH" : "NEUTRAL";

            let volume_profile: VWAPResult["volume_profile"] = "AVERAGE_VOLUME";
            const avgVol = data.slice(0, index + 1).reduce((acc, val) => acc + (val.volume || 0), 0) / (index + 1);
            const lastVol = data[index].volume || 0;

            if (lastVol > avgVol * 1.5) volume_profile = "HIGH_VOLUME_AREA";
            else if (lastVol < avgVol * 0.5) volume_profile = "LOW_VOLUME_AREA";

            return { vwap, position, bias, distance_percent, volume_profile };
        });
    }
}

import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, VWAPResult } from '../types/IndicatorTypes';

export class VWAPIndicator implements IndicatorStrategy<VWAPResult> {
    calculate(data: PriceData[]): VWAPResult[] {
        const results: VWAPResult[] = [];
        let cumulativeTPV = 0;
        let cumulativeVolume = 0;

        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const typicalPrice = (d.high + d.low + d.close) / 3;
            const vol = d.volume || 0;
            cumulativeTPV += typicalPrice * vol;
            cumulativeVolume += vol;

            const vwap = cumulativeVolume ? cumulativeTPV / cumulativeVolume : 0;
            const currentPrice = d.close;
            const distance_percent = ((currentPrice - vwap) / vwap) * 100;

            const position = currentPrice > vwap ? "ABOVE" :
                currentPrice < vwap ? "BELOW" : "AT_VWAP";

            const bias = distance_percent > 1 ? "BULLISH" :
                distance_percent < -1 ? "BEARISH" : "NEUTRAL";

            let volume_profile: VWAPResult["volume_profile"] = "AVERAGE_VOLUME";
            const avgVol = cumulativeVolume / (i + 1);
            const lastVol = d.volume || 0;

            if (lastVol > avgVol * 1.5) volume_profile = "HIGH_VOLUME_AREA";
            else if (lastVol < avgVol * 0.5) volume_profile = "LOW_VOLUME_AREA";

            results.push({ vwap, position, bias, distance_percent, volume_profile });
        }

        return results;
    }
}
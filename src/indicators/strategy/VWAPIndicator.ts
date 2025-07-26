import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, VWAPResult } from '../types/IndicatorTypes';

export class VWAPIndicator implements IndicatorStrategy<VWAPResult> {
    calculate(data: PriceData[]): VWAPResult {
        let cumulativeTPV = 0;
        let cumulativeVolume = 0;

        for (const d of data) {
            const typicalPrice = (d.high + d.low + d.close) / 3;
            const vol = d.volume || 0;
            cumulativeTPV += typicalPrice * vol;
            cumulativeVolume += vol;
        }

        const vwap = cumulativeVolume ? cumulativeTPV / cumulativeVolume : 0;
        const currentPrice = data[data.length - 1].close;
        const distance_percent = ((currentPrice - vwap) / vwap) * 100;

        const position = currentPrice > vwap ? "ABOVE" :
            currentPrice < vwap ? "BELOW" : "AT_VWAP";

        const bias = distance_percent > 1 ? "BULLISH" :
            distance_percent < -1 ? "BEARISH" : "NEUTRAL";

        let volume_profile: VWAPResult["volume_profile"] = "AVERAGE_VOLUME";
        const avgVol = cumulativeVolume / data.length;
        const lastVol = data[data.length - 1].volume || 0;

        if (lastVol > avgVol * 1.5) volume_profile = "HIGH_VOLUME_AREA";
        else if (lastVol < avgVol * 0.5) volume_profile = "LOW_VOLUME_AREA";

        return { vwap, position, bias, distance_percent, volume_profile };
    }
}
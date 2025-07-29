import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, BollingerBandsResult } from '../types/IndicatorTypes';

export class BollingerBandsIndicator implements IndicatorStrategy<BollingerBandsResult> {
    constructor(
        private period: number = 20,
        private standardDeviations: number = 2
    ) { }

    calculate(data: PriceData[]): BollingerBandsResult {
        if (data.length < this.period) {
            throw new Error(`Bollinger Bands requiere al menos ${this.period} períodos de datos`);
        }

        const closes = data.slice(-this.period).map(d => d.close);
        const currentPrice = data[data.length - 1].close;

        const middle = this.calculateSMA(closes);

        const standardDeviation = this.calculateStandardDeviation(closes, middle);

        const upper = middle + (standardDeviation * this.standardDeviations);
        const lower = middle - (standardDeviation * this.standardDeviations);

        const width = ((upper - lower) / middle) * 100;

        const percent_b = (currentPrice - lower) / (upper - lower);

        const signal = this.determineSignal(currentPrice, upper, lower, width, percent_b);

        const position = this.determinePosition(currentPrice, upper, lower, middle);

        const volatility = this.determineVolatility(width);

        const squeeze_status = this.detectSqueeze(data, width);

        return {
            middle: Number(middle.toFixed(6)),
            upper: Number(upper.toFixed(6)),
            lower: Number(lower.toFixed(6)),
            width: Number(width.toFixed(4)),
            percent_b: Number(percent_b.toFixed(4)),
            signal,
            position,
            volatility,
            squeeze_status
        };
    }

    private calculateSMA(prices: number[]): number {
        return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    private calculateStandardDeviation(prices: number[], mean: number): number {
        const squaredDifferences = prices.map(price => Math.pow(price - mean, 2));
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / prices.length;
        return Math.sqrt(variance);
    }

    private determineSignal(
        currentPrice: number,
        upper: number,
        lower: number,
        width: number,
        percentB: number
    ): BollingerBandsResult['signal'] {
        if (width < 5) {
            return 'SQUEEZE';
        }

        if (currentPrice > upper || percentB > 1) {
            return 'OVERBOUGHT';
        } else if (currentPrice < lower || percentB < 0) {
            return 'OVERSOLD';
        } else {
            return 'NEUTRAL';
        }
    }

    private determinePosition(
        currentPrice: number,
        upper: number,
        lower: number,
        middle: number
    ): BollingerBandsResult['position'] {
        if (currentPrice > upper) {
            return 'ABOVE_UPPER';
        } else if (currentPrice < lower) {
            return 'BELOW_LOWER';
        } else if (Math.abs(currentPrice - middle) < (upper - lower) * 0.1) {
            return 'AT_MIDDLE';
        } else {
            return 'BETWEEN_BANDS';
        }
    }

    private determineVolatility(width: number): BollingerBandsResult['volatility'] {
        if (width > 15) {
            return 'HIGH';
        } else if (width > 8) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }

    private detectSqueeze(
        data: PriceData[],
        currentWidth: number
    ): BollingerBandsResult['squeeze_status'] {
        if (data.length < this.period * 2) {
            return 'NORMAL';
        }

        const recentWidths: number[] = [];

        for (let i = this.period; i < Math.min(data.length, this.period * 2); i++) {
            const periodData = data.slice(i - this.period, i);
            const closes = periodData.map(d => d.close);
            const sma = this.calculateSMA(closes);
            const stdDev = this.calculateStandardDeviation(closes, sma);
            const upper = sma + (stdDev * this.standardDeviations);
            const lower = sma - (stdDev * this.standardDeviations);
            const width = ((upper - lower) / sma) * 100;
            recentWidths.push(width);
        }

        if (recentWidths.length === 0) {
            return 'NORMAL';
        }

        const avgWidth = recentWidths.reduce((sum, w) => sum + w, 0) / recentWidths.length;
        const widthRatio = currentWidth / avgWidth;

        if (widthRatio < 0.7 && currentWidth < 6) {
            return 'IN_SQUEEZE';
        } else if (widthRatio < 0.8 && currentWidth < 8) {
            return 'ENTERING_SQUEEZE';
        } else if (widthRatio > 1.3 && currentWidth > 10) {
            return 'EXITING_SQUEEZE';
        } else {
            return 'NORMAL';
        }
    }
}
import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, StochasticResult } from '../types/IndicatorTypes';

export class StochasticIndicator implements IndicatorStrategy<StochasticResult> {
    constructor(
        private kPeriod: number = 14,
        private dPeriod: number = 3,
        private slowing: number = 3
    ) { }

    calculate(data: PriceData[]): StochasticResult {
        if (data.length < this.kPeriod + this.slowing + this.dPeriod) {
            throw new Error(`Stochastic requiere al menos ${this.kPeriod + this.slowing + this.dPeriod} períodos de datos`);
        }

        const kValues: number[] = [];
        const startIndex = Math.max(0, data.length - (this.kPeriod + this.slowing + this.dPeriod));

        for (let i = startIndex + this.kPeriod - 1; i < data.length; i++) {
            const periodData = data.slice(i - this.kPeriod + 1, i + 1);
            const k = this.calculateRawK(periodData);
            kValues.push(k);
        }

        const smoothedKValues = this.applySmoothingToK(kValues);

        const dValues = this.calculateD(smoothedKValues);

        const currentK = smoothedKValues[smoothedKValues.length - 1];
        const currentD = dValues[dValues.length - 1];
        const previousK = smoothedKValues[smoothedKValues.length - 2] || currentK;
        const previousD = dValues[dValues.length - 2] || currentD;

        const signal = this.determineSignal(currentK, currentD);
        const crossover = this.detectCrossover(currentK, currentD, previousK, previousD);
        const position = this.determinePosition(currentK);
        const divergence = this.detectDivergence(data, smoothedKValues);
        const momentum = this.analyzeMomentum(smoothedKValues);

        return {
            k_percent: Number(currentK.toFixed(2)),
            d_percent: Number(currentD.toFixed(2)),
            signal,
            crossover,
            position,
            divergence,
            momentum
        };
    }

    private calculateRawK(periodData: PriceData[]): number {
        const currentClose = periodData[periodData.length - 1].close;
        const highestHigh = Math.max(...periodData.map(d => d.high));
        const lowestLow = Math.min(...periodData.map(d => d.low));

        if (highestHigh === lowestLow) {
            return 50;
        }

        return ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    }

    private applySmoothingToK(rawKValues: number[]): number[] {
        if (this.slowing <= 1) {
            return rawKValues;
        }

        const smoothedK: number[] = [];

        for (let i = this.slowing - 1; i < rawKValues.length; i++) {
            const slice = rawKValues.slice(i - this.slowing + 1, i + 1);
            const smoothed = slice.reduce((sum, val) => sum + val, 0) / slice.length;
            smoothedK.push(smoothed);
        }

        return smoothedK;
    }

    private calculateD(kValues: number[]): number[] {
        const dValues: number[] = [];

        for (let i = this.dPeriod - 1; i < kValues.length; i++) {
            const slice = kValues.slice(i - this.dPeriod + 1, i + 1);
            const d = slice.reduce((sum, val) => sum + val, 0) / slice.length;
            dValues.push(d);
        }

        return dValues;
    }

    private determineSignal(kPercent: number, dPercent: number): StochasticResult['signal'] {
        const avgValue = (kPercent + dPercent) / 2;

        if (avgValue <= 20) {
            return 'OVERSOLD';
        } else if (avgValue >= 80) {
            return 'OVERBOUGHT';
        } else {
            return 'NEUTRAL';
        }
    }

    private detectCrossover(
        currentK: number,
        currentD: number,
        previousK: number,
        previousD: number
    ): StochasticResult['crossover'] {
        const currentCross = currentK - currentD;
        const previousCross = previousK - previousD;

        if (previousCross <= 0 && currentCross > 0) {
            return 'BULLISH_CROSSOVER';
        }
        else if (previousCross >= 0 && currentCross < 0) {
            return 'BEARISH_CROSSOVER';
        }
        else {
            return 'NONE';
        }
    }

    private determinePosition(kPercent: number): StochasticResult['position'] {
        if (kPercent <= 10) {
            return 'EXTREME_OVERSOLD';
        } else if (kPercent <= 20) {
            return 'OVERSOLD';
        } else if (kPercent >= 90) {
            return 'EXTREME_OVERBOUGHT';
        } else if (kPercent >= 80) {
            return 'OVERBOUGHT';
        } else {
            return 'NEUTRAL';
        }
    }

    private detectDivergence(
        priceData: PriceData[],
        stochasticValues: number[]
    ): StochasticResult['divergence'] {
        if (priceData.length < 10 || stochasticValues.length < 10) {
            return 'NO_DIVERGENCE';
        }

        const recentPrices = priceData.slice(-10).map(d => d.close);
        const recentStoch = stochasticValues.slice(-10);

        const priceHighs = this.findLocalExtremes(recentPrices, 'high');
        const priceLows = this.findLocalExtremes(recentPrices, 'low');

        const stochHighs = this.findLocalExtremes(recentStoch, 'high');
        const stochLows = this.findLocalExtremes(recentStoch, 'low');

        if (priceLows.length >= 2 && stochLows.length >= 2) {
            const lastPriceLow = priceLows[priceLows.length - 1];
            const prevPriceLow = priceLows[priceLows.length - 2];
            const lastStochLow = stochLows[stochLows.length - 1];
            const prevStochLow = stochLows[stochLows.length - 2];

            if (lastPriceLow.value < prevPriceLow.value && lastStochLow.value > prevStochLow.value) {
                return 'BULLISH_DIVERGENCE';
            }
        }

        if (priceHighs.length >= 2 && stochHighs.length >= 2) {
            const lastPriceHigh = priceHighs[priceHighs.length - 1];
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const lastStochHigh = stochHighs[stochHighs.length - 1];
            const prevStochHigh = stochHighs[stochHighs.length - 2];

            if (lastPriceHigh.value > prevPriceHigh.value && lastStochHigh.value < prevStochHigh.value) {
                return 'BEARISH_DIVERGENCE';
            }
        }

        return 'NO_DIVERGENCE';
    }

    private findLocalExtremes(data: number[], type: 'high' | 'low'): Array<{ index: number, value: number }> {
        const extremes: Array<{ index: number, value: number }> = [];

        for (let i = 1; i < data.length - 1; i++) {
            const current = data[i];
            const prev = data[i - 1];
            const next = data[i + 1];

            if (type === 'high' && current > prev && current > next) {
                extremes.push({ index: i, value: current });
            } else if (type === 'low' && current < prev && current < next) {
                extremes.push({ index: i, value: current });
            }
        }

        return extremes;
    }

    private analyzeMomentum(stochasticValues: number[]): StochasticResult['momentum'] {
        if (stochasticValues.length < 3) {
            return 'STABLE';
        }

        const recent = stochasticValues.slice(-3);
        const trend = recent[2] - recent[0];

        if (trend > 5) {
            return 'INCREASING';
        } else if (trend < -5) {
            return 'DECREASING';
        } else {
            return 'STABLE';
        }
    }
}
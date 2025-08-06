import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, StochasticResult } from '../types/IndicatorTypes';
import { Stochastic } from 'technicalindicators';
import { StochasticInput } from 'technicalindicators/declarations/momentum/Stochastic';

export class StochasticIndicator implements IndicatorStrategy<StochasticResult> {
    constructor(
        private kPeriod: number = 14,
        private dPeriod: number = 3,
    ) { }

    calculate(data: PriceData[]): StochasticResult[] {
        const stochasticInput: StochasticInput = {
            high: data.map(d => d.high),
            low: data.map(d => d.low),
            close: data.map(d => d.close),
            period: this.kPeriod,
            signalPeriod: this.dPeriod
        };

        const stochasticValues = Stochastic.calculate(stochasticInput);

        return stochasticValues.map(stochastic => {
            const signal = this.determineSignal(stochastic.k, stochastic.d);
            const crossover = this.detectCrossover(stochastic.k, stochastic.d, stochastic.k, stochastic.d);
            const position = this.determinePosition(stochastic.k);
            const divergence = this.detectDivergence(data, [stochastic.k]);
            const momentum = this.analyzeMomentum([stochastic.k]);

            return {
                k_percent: stochastic.k,
                d_percent: stochastic.d,
                signal,
                crossover,
                position,
                divergence,
                momentum
            };
        });
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

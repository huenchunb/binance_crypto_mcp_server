import { IndicatorStrategy } from './IndicatorStrategy';
import { PriceData, WilliamsRResult } from '../types/IndicatorTypes';

export class WilliamsRIndicator implements IndicatorStrategy<WilliamsRResult> {
    constructor(private period: number = 14) { }

    calculate(data: PriceData[]): WilliamsRResult {
        if (data.length < this.period) {
            throw new Error(`Williams %R requiere al menos ${this.period} períodos de datos`);
        }

        const periodData = data.slice(-this.period);
        const currentClose = data[data.length - 1].close;

        const highestHigh = Math.max(...periodData.map(d => d.high));
        const lowestLow = Math.min(...periodData.map(d => d.low));

        let williamsR: number;
        if (highestHigh === lowestLow) {
            williamsR = -50;
        } else {
            williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
        }

        const signal = this.determineSignal(williamsR);
        const position = this.determinePosition(williamsR);
        const momentum = this.analyzeMomentum(data);
        const reversalSignal = this.detectReversalSignal(williamsR, data);
        const trendStrength = this.analyzeTrendStrength(data);
        const divergence = this.detectDivergence(data);

        return {
            williams_r: Number(williamsR.toFixed(2)),
            signal,
            position,
            momentum,
            reversal_signal: reversalSignal,
            trend_strength: trendStrength,
            divergence
        };
    }

    private determineSignal(williamsR: number): WilliamsRResult['signal'] {
        if (williamsR <= -80) {
            return 'OVERSOLD';
        } else if (williamsR >= -20) {
            return 'OVERBOUGHT';
        } else {
            return 'NEUTRAL';
        }
    }

    private determinePosition(williamsR: number): WilliamsRResult['position'] {
        if (williamsR <= -90) {
            return 'EXTREME_OVERSOLD';
        } else if (williamsR <= -80) {
            return 'OVERSOLD';
        } else if (williamsR >= -10) {
            return 'EXTREME_OVERBOUGHT';
        } else if (williamsR >= -20) {
            return 'OVERBOUGHT';
        } else {
            return 'NEUTRAL';
        }
    }

    private analyzeMomentum(data: PriceData[]): WilliamsRResult['momentum'] {
        if (data.length < this.period + 5) {
            return 'NEUTRAL';
        }

        const recentWR: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const endIndex = data.length - i;
            const startIndex = endIndex - this.period;

            if (startIndex >= 0) {
                const periodData = data.slice(startIndex, endIndex);
                const currentClose = data[endIndex - 1].close;
                const highestHigh = Math.max(...periodData.map(d => d.high));
                const lowestLow = Math.min(...periodData.map(d => d.low));

                let wr: number;
                if (highestHigh === lowestLow) {
                    wr = -50;
                } else {
                    wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
                }
                recentWR.push(wr);
            }
        }

        if (recentWR.length < 3) {
            return 'NEUTRAL';
        }

        const firstHalf = recentWR.slice(0, Math.floor(recentWR.length / 2));
        const secondHalf = recentWR.slice(Math.floor(recentWR.length / 2));

        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 10) {
            return 'BULLISH';
        } else if (secondAvg < firstAvg - 10) {
            return 'BEARISH';
        } else {
            return 'NEUTRAL';
        }
    }

    private detectReversalSignal(
        currentWR: number,
        data: PriceData[]
    ): WilliamsRResult['reversal_signal'] {
        if (data.length < this.period + 3) {
            return 'NO_REVERSAL';
        }

        const recentWR: number[] = [];

        for (let i = 2; i >= 0; i--) {
            const endIndex = data.length - i;
            const startIndex = endIndex - this.period;

            if (startIndex >= 0) {
                const periodData = data.slice(startIndex, endIndex);
                const currentClose = data[endIndex - 1].close;
                const highestHigh = Math.max(...periodData.map(d => d.high));
                const lowestLow = Math.min(...periodData.map(d => d.low));

                let wr: number;
                if (highestHigh === lowestLow) {
                    wr = -50;
                } else {
                    wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
                }
                recentWR.push(wr);
            }
        }

        if (recentWR.length < 3) {
            return 'NO_REVERSAL';
        }

        const [oldest, middle, newest] = recentWR;

        if (oldest <= -80 && middle <= -70 && newest >= -60) {
            return 'STRONG_REVERSAL';
        }

        if (oldest >= -20 && middle >= -30 && newest <= -40) {
            return 'STRONG_REVERSAL';
        }

        if ((oldest <= -70 && newest >= -50) || (oldest >= -30 && newest <= -50)) {
            return 'WEAK_REVERSAL';
        }

        return 'NO_REVERSAL';
    }

    private analyzeTrendStrength(data: PriceData[]): WilliamsRResult['trend_strength'] {
        if (data.length < this.period * 2) {
            return 'WEAK';
        }

        const wrValues: number[] = [];
        const lookbackPeriods = Math.min(10, data.length - this.period);

        for (let i = 0; i < lookbackPeriods; i++) {
            const endIndex = data.length - i;
            const startIndex = endIndex - this.period;
            const periodData = data.slice(startIndex, endIndex);
            const currentClose = data[endIndex - 1].close;
            const highestHigh = Math.max(...periodData.map(d => d.high));
            const lowestLow = Math.min(...periodData.map(d => d.low));

            let wr: number;
            if (highestHigh === lowestLow) {
                wr = -50;
            } else {
                wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
            }
            wrValues.push(wr);
        }

        const avgWR = wrValues.reduce((sum, val) => sum + val, 0) / wrValues.length;
        const variance = wrValues.reduce((sum, val) => sum + Math.pow(val - avgWR, 2), 0) / wrValues.length;
        const stdDev = Math.sqrt(variance);

        const recentPrices = data.slice(-this.period).map(d => d.close);
        const priceRange = Math.max(...recentPrices) - Math.min(...recentPrices);
        const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
        const priceVolatility = (priceRange / avgPrice) * 100;

        if (stdDev > 20 || priceVolatility > 15) {
            return 'WEAK';
        } else if (stdDev < 10 && priceVolatility < 5) {
            return 'STRONG';
        } else {
            return 'MODERATE';
        }
    }

    private detectDivergence(data: PriceData[]): WilliamsRResult['divergence'] {
        if (data.length < this.period + 10) {
            return 'NO_DIVERGENCE';
        }

        const wrHistory: number[] = [];
        const priceHistory: number[] = [];
        const lookbackPeriods = Math.min(10, data.length - this.period);

        for (let i = lookbackPeriods - 1; i >= 0; i--) {
            const endIndex = data.length - i;
            const startIndex = endIndex - this.period;
            const periodData = data.slice(startIndex, endIndex);
            const currentClose = data[endIndex - 1].close;
            const highestHigh = Math.max(...periodData.map(d => d.high));
            const lowestLow = Math.min(...periodData.map(d => d.low));

            let wr: number;
            if (highestHigh === lowestLow) {
                wr = -50;
            } else {
                wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
            }

            wrHistory.push(wr);
            priceHistory.push(currentClose);
        }

        if (wrHistory.length < 6) {
            return 'NO_DIVERGENCE';
        }

        const priceHighs = this.findLocalExtremes(priceHistory, 'high');
        const priceLows = this.findLocalExtremes(priceHistory, 'low');
        const wrHighs = this.findLocalExtremes(wrHistory, 'high');
        const wrLows = this.findLocalExtremes(wrHistory, 'low');

        if (priceLows.length >= 2 && wrLows.length >= 2) {
            const recentPriceLow = priceLows[priceLows.length - 1];
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentWRLow = wrLows[wrLows.length - 1];
            const prevWRLow = wrLows[wrLows.length - 2];

            if (recentPriceLow.value < prevPriceLow.value && recentWRLow.value > prevWRLow.value) {
                return 'BULLISH_DIVERGENCE';
            }
        }

        if (priceHighs.length >= 2 && wrHighs.length >= 2) {
            const recentPriceHigh = priceHighs[priceHighs.length - 1];
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentWRHigh = wrHighs[wrHighs.length - 1];
            const prevWRHigh = wrHighs[wrHighs.length - 2];

            if (recentPriceHigh.value > prevPriceHigh.value && recentWRHigh.value < prevWRHigh.value) {
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
}
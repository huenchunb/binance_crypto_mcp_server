import { IndicatorStrategy } from '../strategy/IndicatorStrategy';
import { RSIIndicator } from '../strategy/RSIIndicator';
import { MACDIndicator } from '../strategy/MACDIndicator';
import { VWAPIndicator } from '../strategy/VWAPIndicator';
import { OBVIndicator } from '../strategy/OBVIndicator';
import { MFIIndicator } from '../strategy/MFIIndicator';
import { CMFIndicator } from '../strategy/CMFIndicator';
import { MovingAverageIndicator } from '../strategy/MovingAverageIndicator';
import { BollingerBandsIndicator } from '../strategy/BollingerBandsIndicator';
import { StochasticIndicator } from '../strategy/StochasticIndicator';
import { WilliamsRIndicator } from '../strategy/WilliamsRIndicator';

import {
    RSIResult,
    MACDResult,
    VWAPResult,
    OBVResult,
    MFIResult,
    CMFResult,
    MovingAverageResult,
    BollingerBandsResult,
    StochasticResult,
    WilliamsRResult
} from '../types/IndicatorTypes';

export class IndicatorFactory {
    static create(type: 'RSI'): IndicatorStrategy<RSIResult>;
    static create(type: 'MACD'): IndicatorStrategy<MACDResult>;
    static create(type: 'VWAP'): IndicatorStrategy<VWAPResult>;
    static create(type: 'OBV'): IndicatorStrategy<OBVResult>;
    static create(type: 'MFI'): IndicatorStrategy<MFIResult>;
    static create(type: 'CMF'): IndicatorStrategy<CMFResult>;
    static create(type: 'MA20' | 'MA50' | 'MA200'): IndicatorStrategy<MovingAverageResult>;
    static create(type: 'BOLLINGER_BANDS'): IndicatorStrategy<BollingerBandsResult>;
    static create(type: 'STOCHASTIC'): IndicatorStrategy<StochasticResult>;
    static create(type: 'WILLIAMS_R'): IndicatorStrategy<WilliamsRResult>;
    static create(type: string): IndicatorStrategy<any> {
        switch (type.toUpperCase()) {
            case 'RSI':
                return new RSIIndicator();
            case 'MACD':
                return new MACDIndicator();
            case 'VWAP':
                return new VWAPIndicator();
            case 'OBV':
                return new OBVIndicator();
            case 'MFI':
                return new MFIIndicator();
            case 'CMF':
                return new CMFIndicator();
            case 'MA20':
                return new MovingAverageIndicator(20);
            case 'MA50':
                return new MovingAverageIndicator(50);
            case 'MA200':
                return new MovingAverageIndicator(200);
            case 'BOLLINGER_BANDS':
                return new BollingerBandsIndicator(20, 2);
            case 'STOCHASTIC':
                return new StochasticIndicator(14, 3, 3);
            case 'WILLIAMS_R':
                return new WilliamsRIndicator(14);
            default:
                throw new Error(`Unsupported indicator type: ${type}`);
        }
    }

    /**
     * Método para crear indicadores con parámetros personalizados
     */
    static createWithParams(type: string, params: any): IndicatorStrategy<any> {
        switch (type.toUpperCase()) {
            case 'RSI':
                return new RSIIndicator(params.period || 14);
            case 'MACD':
                return new MACDIndicator(
                    params.shortPeriod || 12,
                    params.longPeriod || 26,
                    params.signalPeriod || 9
                );
            case 'MA20':
                return new MovingAverageIndicator(20);
            case 'MA50':
                return new MovingAverageIndicator(50);
            case 'MA200':
                return new MovingAverageIndicator(200);
            case 'BOLLINGER_BANDS':
            case 'BB':
                return new BollingerBandsIndicator(
                    params.period || 20,
                    params.standardDeviations || 2
                );
            case 'STOCHASTIC':
            case 'STOCH':
                return new StochasticIndicator(
                    params.kPeriod || 14,
                    params.dPeriod || 3,
                    params.slowing || 3
                );
            case 'WILLIAMS_R':
            case 'WILLIAMS':
            case 'WR':
                return new WilliamsRIndicator(params.period || 14);

            default:
                return this.create(type as any);
        }
    }

    /**
         * Obtiene la lista de todos los indicadores disponibles
         */
    static getAvailableIndicators(): string[] {
        return [
            'RSI',
            'MACD',
            'VWAP',
            'OBV',
            'MFI',
            'CMF',
            'MA20',
            'MA50',
            'MA200',
            'BOLLINGER_BANDS',
            'STOCHASTIC',
            'WILLIAMS_R'
        ];
    }

    /**
     * Obtiene información sobre un indicador específico
     */
    static getIndicatorInfo(type: string): any {
        switch (type.toUpperCase()) {
            case 'RSI':
                return {
                    name: 'Relative Strength Index',
                    description: 'Indicador de momentum para identificar condiciones de sobrecompra y sobreventa',
                    defaultParams: { period: 14 },
                    outputRange: '0-100',
                    signals: ['OVERSOLD (<30)', 'OVERBOUGHT (>70)', 'NEUTRAL']
                };
            case 'BOLLINGER_BANDS':
                return {
                    name: 'Bollinger Bands',
                    description: 'Bandas de volatilidad para identificar sobrecompra/sobreventa y squeeze',
                    defaultParams: { period: 20, standardDeviations: 2 },
                    signals: ['OVERSOLD', 'OVERBOUGHT', 'SQUEEZE', 'NEUTRAL'],
                    components: ['Upper Band', 'Middle Band (SMA)', 'Lower Band', 'Width', '%B']
                };
            case 'STOCHASTIC':
                return {
                    name: 'Stochastic Oscillator',
                    description: 'Oscilador de momentum que compara precio de cierre con rango de precios',
                    defaultParams: { kPeriod: 14, dPeriod: 3, slowing: 3 },
                    outputRange: '0-100',
                    signals: ['OVERSOLD (<20)', 'OVERBOUGHT (>80)', 'CROSSOVERS'],
                    components: ['%K (Fast Line)', '%D (Slow Line)']
                };
            case 'WILLIAMS_R':
                return {
                    name: 'Williams %R',
                    description: 'Oscilador de momentum que mide niveles de sobrecompra y sobreventa',
                    defaultParams: { period: 14 },
                    outputRange: '-100 to 0',
                    signals: ['OVERSOLD (<-80)', 'OVERBOUGHT (>-20)', 'REVERSALS'],
                    characteristics: ['Inverted scale', 'Leading indicator', 'Divergence detection']
                };
            default:
                return null;
        }
    }
}
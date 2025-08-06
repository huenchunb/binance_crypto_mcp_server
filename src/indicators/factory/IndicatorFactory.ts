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
import { ATRIndicator } from '../strategy/ATRIndicator';
import { ADXIndicator } from '../strategy/ADXIndicator';
import { IchimokuCloudIndicator } from '../strategy/IchimokuCloudIndicator';
import { ParabolicSARIndicator } from '../strategy/ParabolicSARIndicator';
import { StochasticRSIIndicator } from '../strategy/StochasticRSIIndicator';
import { AwesomeOscillatorIndicator } from '../strategy/AwesomeOscillatorIndicator';
import { ForceIndexIndicator } from '../strategy/ForceIndexIndicator';
import { KeltnerChannelIndicator } from '../strategy/KeltnerChannelIndicator';

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
    WilliamsRResult,
    ATRResult,
    ADXResult,
    IchimokuCloudResult,
    ParabolicSARResult,
    StochasticRSIResult,
    AwesomeOscillatorResult,
    ForceIndexResult,
    KeltnerChannelResult
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
    static create(type: 'ATR'): IndicatorStrategy<ATRResult>;
    static create(type: 'ADX'): IndicatorStrategy<ADXResult>;
    static create(type: 'ICHIMOKU_CLOUD'): IndicatorStrategy<IchimokuCloudResult>;
    static create(type: 'PARABOLIC_SAR'): IndicatorStrategy<ParabolicSARResult>;
    static create(type: 'STOCHASTIC_RSI'): IndicatorStrategy<StochasticRSIResult>;
    static create(type: 'AWESOME_OSCILLATOR'): IndicatorStrategy<AwesomeOscillatorResult>;
    static create(type: 'FORCE_INDEX'): IndicatorStrategy<ForceIndexResult>;
    static create(type: 'KELTNER_CHANNEL'): IndicatorStrategy<KeltnerChannelResult>;
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
                return new StochasticIndicator(14, 3);
            case 'WILLIAMS_R':
                return new WilliamsRIndicator(14);
            case 'ATR':
                return new ATRIndicator(14);
            case 'ADX':
                return new ADXIndicator(14);
            case 'ICHIMOKU_CLOUD':
                return new IchimokuCloudIndicator();
            case 'PARABOLIC_SAR':
                return new ParabolicSARIndicator();
            case 'STOCHASTIC_RSI':
                return new StochasticRSIIndicator();
            case 'AWESOME_OSCILLATOR':
                return new AwesomeOscillatorIndicator();
            case 'FORCE_INDEX':
                return new ForceIndexIndicator();
            case 'KELTNER_CHANNEL':
                return new KeltnerChannelIndicator();
            default:
                throw new Error(`Unsupported indicator type: ${type}`);
        }
    }

    static createMany(types: string[]): IndicatorStrategy<any>[] {
        return types.map(type => this.create(type as any));
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
                    params.dPeriod || 3
                );
            case 'WILLIAMS_R':
            case 'WILLIAMS':
            case 'WR':
                return new WilliamsRIndicator(params.period || 14);
            case 'ATR':
                return new ATRIndicator(params.period || 14);
            case 'ADX':
                return new ADXIndicator(params.period || 14);
            case 'ICHIMOKU_CLOUD':
                return new IchimokuCloudIndicator(
                    params.conversionPeriod || 9,
                    params.basePeriod || 26,
                    params.spanPeriod || 52,
                    params.displacement || 26
                );
            case 'PARABOLIC_SAR':
            case 'PSAR':
                return new ParabolicSARIndicator(
                    params.step || 0.02,
                    params.max || 0.2
                );
            case 'STOCHASTIC_RSI':
            case 'STOCHRSI':
                return new StochasticRSIIndicator(
                    params.rsiPeriod || 14,
                    params.stochasticPeriod || 14,
                    params.kPeriod || 3,
                    params.dPeriod || 3
                );
            case 'AWESOME_OSCILLATOR':
            case 'AO':
                return new AwesomeOscillatorIndicator(
                    params.fastPeriod || 5,
                    params.slowPeriod || 34
                );
            case 'FORCE_INDEX':
            case 'FI':
                return new ForceIndexIndicator(params.period || 1);
            case 'KELTNER_CHANNEL':
            case 'KC':
                return new KeltnerChannelIndicator(
                    params.period || 20,
                    params.multiplier || 2,
                    params.atrPeriod || 10
                );

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
            'WILLIAMS_R',
            'ATR',
            'ADX',
            'ICHIMOKU_CLOUD',
            'PARABOLIC_SAR',
            'STOCHASTIC_RSI',
            'AWESOME_OSCILLATOR',
            'FORCE_INDEX',
            'KELTNER_CHANNEL'
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
            case 'ATR':
                return {
                    name: 'Average True Range',
                    description: 'Indicador de volatilidad que mide el rango promedio verdadero',
                    defaultParams: { period: 14 },
                    outputRange: '0 to infinity',
                    signals: ['HIGH_VOLATILITY', 'LOW_VOLATILITY', 'NEUTRAL'],
                    characteristics: ['Volatility indicator', 'Not directional']
                };
            case 'ADX':
                return {
                    name: 'Average Directional Index',
                    description: 'Mide la fuerza de la tendencia',
                    defaultParams: { period: 14 },
                    outputRange: '0-100',
                    signals: ['STRONG_TREND (>25)', 'WEAK_TREND (<20)', 'NO_TREND'],
                    components: ['ADX', '+DI', '-DI']
                };
            case 'ICHIMOKU_CLOUD':
                return {
                    name: 'Ichimoku Cloud',
                    description: 'Indicador completo que muestra soporte/resistencia, tendencia y señales',
                    defaultParams: { conversionPeriod: 9, basePeriod: 26, spanPeriod: 52, displacement: 26 },
                    signals: ['BULLISH_CROSS', 'BEARISH_CROSS', 'CLOUD_BREAKOUT'],
                    components: ['Tenkan-sen (Conversion Line)', 'Kijun-sen (Base Line)', 'Senkou Span A (Leading Span A)', 'Senkou Span B (Leading Span B)', 'Chikou Span (Lagging Span)']
                };
            case 'PARABOLIC_SAR':
                return {
                    name: 'Parabolic SAR',
                    description: 'Identifica posibles reversiones de tendencia',
                    defaultParams: { step: 0.02, max: 0.2 },
                    signals: ['BUY_SIGNAL (dots below price)', 'SELL_SIGNAL (dots above price)'],
                    characteristics: ['Trailing stop-loss', 'Trend following']
                };
            case 'STOCHASTIC_RSI':
                return {
                    name: 'Stochastic RSI',
                    description: 'Mide el nivel de RSI en relación con su rango alto/bajo durante un período de tiempo',
                    defaultParams: { rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3 },
                    outputRange: '0-100',
                    signals: ['OVERSOLD (<20)', 'OVERBOUGHT (>80)'],
                    components: ['%K', '%D']
                };
            case 'AWESOME_OSCILLATOR':
                return {
                    name: 'Awesome Oscillator',
                    description: 'Mide el momentum del mercado',
                    defaultParams: { fastPeriod: 5, slowPeriod: 34 },
                    signals: ['BULLISH_SAUCER', 'BEARISH_SAUCER', 'ZERO_LINE_CROSSOVER'],
                    characteristics: ['Momentum indicator', 'Histogram']
                };
            case 'FORCE_INDEX':
                return {
                    name: 'Force Index',
                    description: 'Mide la fuerza de los movimientos de precios incorporando el volumen',
                    defaultParams: { period: 1 },
                    signals: ['BULLISH_FORCE', 'BEARISH_FORCE'],
                    characteristics: ['Volume indicator', 'Trend confirmation']
                };
            case 'KELTNER_CHANNEL':
                return {
                    name: 'Keltner Channel',
                    description: 'Bandas de volatilidad que usan ATR para identificar tendencias y reversiones',
                    defaultParams: { period: 20, multiplier: 2, atrPeriod: 10 },
                    signals: ['BREAKOUT_UPPER', 'BREAKOUT_LOWER', 'REVERSION_TO_MEAN'],
                    components: ['Middle Line (EMA)', 'Upper Band', 'Lower Band']
                };
            default:
                return null;
        }
    }
}
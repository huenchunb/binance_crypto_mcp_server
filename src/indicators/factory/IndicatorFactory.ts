import { IndicatorStrategy } from '../strategy/IndicatorStrategy';
import { RSIIndicator } from '../strategy/RSIIndicator';
import { MACDIndicator } from '../strategy/MACDIndicator';
import { VWAPIndicator } from '../strategy/VWAPIndicator';
import { OBVIndicator } from '../strategy/OBVIndicator';
import { MFIIndicator } from '../strategy/MFIIndicator';
import { CMFIndicator } from '../strategy/CMFIndicator';
import { MovingAverageIndicator } from '../strategy/MovingAverageIndicator';

import {
    RSIResult,
    MACDResult,
    VWAPResult,
    OBVResult,
    MFIResult,
    CMFResult,
    MovingAverageResult
} from '../types/IndicatorTypes';

export class IndicatorFactory {
    static create(type: 'RSI'): IndicatorStrategy<RSIResult>;
    static create(type: 'MACD'): IndicatorStrategy<MACDResult>;
    static create(type: 'VWAP'): IndicatorStrategy<VWAPResult>;
    static create(type: 'OBV'): IndicatorStrategy<OBVResult>;
    static create(type: 'MFI'): IndicatorStrategy<MFIResult>;
    static create(type: 'CMF'): IndicatorStrategy<CMFResult>;
    static create(type: 'MA20' | 'MA50' | 'MA200'): IndicatorStrategy<MovingAverageResult>;
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
            default:
                throw new Error(`Unsupported indicator type: ${type}`);
        }
    }
}
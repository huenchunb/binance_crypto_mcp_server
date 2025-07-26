import { PriceData } from '../types/IndicatorTypes';

export interface IndicatorStrategy<T> {
    calculate(data: PriceData[]): T;
}
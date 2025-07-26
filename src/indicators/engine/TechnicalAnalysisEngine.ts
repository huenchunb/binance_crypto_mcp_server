
import { IndicatorFactory } from '../factory/IndicatorFactory';
import {
  PriceData,
  TechnicalAnalysisResult,
  VWAPResult,
  OBVResult,
  MFIResult,
  CMFResult
} from '../types/IndicatorTypes';

export class TechnicalAnalysisEngine {
  static performCompleteAnalysis(priceData: PriceData[], symbol: string): TechnicalAnalysisResult {
    if (priceData.length < 200) {
      throw new Error('Necesitas al menos 200 períodos para análisis técnico completo');
    }

    const currentPrice = priceData[priceData.length - 1].close;

    const rsi = IndicatorFactory.create('RSI').calculate(priceData);
    const macd = IndicatorFactory.create('MACD').calculate(priceData);
    const ma20 = IndicatorFactory.create('MA20').calculate(priceData);
    const ma50 = IndicatorFactory.create('MA50').calculate(priceData);
    const ma200 = IndicatorFactory.create('MA200').calculate(priceData);
    const vwap = IndicatorFactory.create('VWAP').calculate(priceData);
    const obv = IndicatorFactory.create('OBV').calculate(priceData);
    const mfi = IndicatorFactory.create('MFI').calculate(priceData);
    const cmf = IndicatorFactory.create('CMF').calculate(priceData);

    let score = 0;
    let maxScore = 0;

    maxScore += 2;
    if (rsi.signal === 'OVERSOLD') {
      score += rsi.strength === 'STRONG' ? 2 : 1;
    } else if (rsi.signal === 'OVERBOUGHT') {
      score -= rsi.strength === 'STRONG' ? 2 : 1;
    }

    maxScore += 3;
    if (macd.crossover === 'BULLISH_CROSSOVER') {
      score += 3;
    } else if (macd.crossover === 'BEARISH_CROSSOVER') {
      score -= 3;
    } else if (macd.trend === 'BULLISH') {
      score += 1;
    } else if (macd.trend === 'BEARISH') {
      score -= 1;
    }

    maxScore += 3;
    [ma20, ma50, ma200].forEach(ma => {
      if (ma.position === 'ABOVE' && ma.trend === 'UPTREND') {
        score += 1;
      } else if (ma.position === 'BELOW' && ma.trend === 'DOWNTREND') {
        score -= 1;
      }
    });

    maxScore += 1;
    if (vwap.bias === 'BULLISH' && vwap.volume_profile === 'HIGH_VOLUME_AREA') {
      score += 1;
    } else if (vwap.bias === 'BEARISH' && vwap.volume_profile === 'HIGH_VOLUME_AREA') {
      score -= 1;
    }

    maxScore += 1;
    if (obv.signal === 'BUY' || obv.divergence === 'BULLISH_DIVERGENCE') {
      score += 1;
    } else if (obv.signal === 'SELL' || obv.divergence === 'BEARISH_DIVERGENCE') {
      score -= 1;
    }

    maxScore += 1;
    if (mfi.signal === 'OVERSOLD' && mfi.money_flow === 'POSITIVE') {
      score += 1;
    } else if (mfi.signal === 'OVERBOUGHT' && mfi.money_flow === 'NEGATIVE') {
      score -= 1;
    }

    maxScore += 1;
    if (cmf.flow_type === 'ACCUMULATION' && cmf.strength !== 'WEAK') {
      score += 1;
    } else if (cmf.flow_type === 'DISTRIBUTION' && cmf.strength !== 'WEAK') {
      score -= 1;
    }

    const volumeConfirmation = this.checkVolumeConfirmation(vwap, obv, mfi, cmf, score > 0);

    const normalizedScore = score / maxScore;
    let confidence = Math.abs(normalizedScore) * 100;

    if (volumeConfirmation) {
      confidence = Math.min(confidence * 1.2, 100);
    }

    let overallSignal: TechnicalAnalysisResult['overallSignal'];
    if (normalizedScore >= 0.6) {
      overallSignal = 'STRONG_BUY';
    } else if (normalizedScore >= 0.2) {
      overallSignal = 'BUY';
    } else if (normalizedScore <= -0.6) {
      overallSignal = 'STRONG_SELL';
    } else if (normalizedScore <= -0.2) {
      overallSignal = 'SELL';
    } else {
      overallSignal = 'NEUTRAL';
    }

    return {
      symbol,
      timestamp: new Date().toISOString(),
      currentPrice,
      rsi,
      macd,
      vwap,
      obv,
      mfi,
      cmf,
      movingAverages: { ma20, ma50, ma200 },
      overallSignal,
      confidence: Math.round(confidence),
      volumeConfirmation
    };
  }

  private static checkVolumeConfirmation(
    vwap: VWAPResult,
    obv: OBVResult,
    mfi: MFIResult,
    cmf: CMFResult,
    isBullish: boolean
  ): boolean {
    if (isBullish) {
      return (
        (vwap.bias === 'BULLISH') &&
        (obv.signal === 'BUY') &&
        (mfi.money_flow === 'POSITIVE') &&
        (cmf.flow_type === 'ACCUMULATION')
      );
    } else {
      return (
        (vwap.bias === 'BEARISH') &&
        (obv.signal === 'SELL') &&
        (mfi.money_flow === 'NEGATIVE') &&
        (cmf.flow_type === 'DISTRIBUTION')
      );
    }
  }
}


import { IndicatorFactory } from '../factory/IndicatorFactory';
import {
  PriceData,
  TechnicalAnalysisResult,
  VWAPResult,
  OBVResult,
  MFIResult,
  CMFResult,
  BollingerBandsResult,
  StochasticResult,
  WilliamsRResult,
  RSIResult,
  MACDResult,
  MovingAverageResult
} from '../types/IndicatorTypes';

export class TechnicalAnalysisEngine {
  static performCompleteAnalysis(priceData: PriceData[], symbol: string, outputMode: 'summary' | 'full_data' = 'summary'): TechnicalAnalysisResult {
    if (priceData.length < 200) {
      throw new Error('Necesitas al menos 200 períodos para análisis técnico completo');
    }

    const currentPrice = priceData[priceData.length - 1].close;

    const rsiData = IndicatorFactory.create('RSI').calculate(priceData);
    const macdData = IndicatorFactory.create('MACD').calculate(priceData);
    const ma20Data = IndicatorFactory.create('MA20').calculate(priceData);
    const ma50Data = IndicatorFactory.create('MA50').calculate(priceData);
    const ma200Data = IndicatorFactory.create('MA200').calculate(priceData);
    const vwapData = IndicatorFactory.create('VWAP').calculate(priceData);
    const obvData = IndicatorFactory.create('OBV').calculate(priceData);
    const mfiData = IndicatorFactory.create('MFI').calculate(priceData);
    const cmfData = IndicatorFactory.create('CMF').calculate(priceData);
    const bollingerBandsData = IndicatorFactory.create('BOLLINGER_BANDS').calculate(priceData);
    const stochasticData = IndicatorFactory.create('STOCHASTIC').calculate(priceData);
    const williamsRData = IndicatorFactory.create('WILLIAMS_R').calculate(priceData);

    const rsi = rsiData[rsiData.length - 1];
    const macd = macdData[macdData.length - 1];
    const ma20 = ma20Data[ma20Data.length - 1];
    const ma50 = ma50Data[ma50Data.length - 1];
    const ma200 = ma200Data[ma200Data.length - 1];
    const vwap = vwapData[vwapData.length - 1];
    const obv = obvData[obvData.length - 1];
    const mfi = mfiData[mfiData.length - 1];
    const cmf = cmfData[cmfData.length - 1];
    const bollingerBands = bollingerBandsData[bollingerBandsData.length - 1];
    const stochastic = stochasticData[stochasticData.length - 1];
    const williamsR = williamsRData[williamsRData.length - 1];

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

    maxScore += 2;
    if (bollingerBands.signal === 'OVERSOLD' && bollingerBands.squeeze_status === 'EXITING_SQUEEZE') {
      score += 2;
    } else if (bollingerBands.signal === 'OVERBOUGHT' && bollingerBands.squeeze_status === 'EXITING_SQUEEZE') {
      score -= 2;
    } else if (bollingerBands.signal === 'OVERSOLD') {
      score += 1;
    } else if (bollingerBands.signal === 'OVERBOUGHT') {
      score -= 1;
    }

    maxScore += 2;
    if (stochastic.crossover === 'BULLISH_CROSSOVER' && stochastic.signal === 'OVERSOLD') {
      score += 2;
    } else if (stochastic.crossover === 'BEARISH_CROSSOVER' && stochastic.signal === 'OVERBOUGHT') {
      score -= 2;
    } else if (stochastic.divergence === 'BULLISH_DIVERGENCE') {
      score += 1;
    } else if (stochastic.divergence === 'BEARISH_DIVERGENCE') {
      score -= 1;
    }

    maxScore += 2;
    if (williamsR.reversal_signal === 'STRONG_REVERSAL' && williamsR.signal === 'OVERSOLD') {
      score += 2;
    } else if (williamsR.reversal_signal === 'STRONG_REVERSAL' && williamsR.signal === 'OVERBOUGHT') {
      score -= 2;
    } else if (williamsR.divergence === 'BULLISH_DIVERGENCE') {
      score += 1;
    } else if (williamsR.divergence === 'BEARISH_DIVERGENCE') {
      score -= 1;
    }

    maxScore += 1;
    if (cmf.flow_type === 'ACCUMULATION' && cmf.strength !== 'WEAK') {
      score += 1;
    } else if (cmf.flow_type === 'DISTRIBUTION' && cmf.strength !== 'WEAK') {
      score -= 1;
    }

    const volumeConfirmation = this.checkVolumeConfirmation(vwap, obv, mfi, cmf, score > 0);

    const volatilityLevel = bollingerBands.volatility;

    const normalizedScore = score / maxScore;
    let confidence = Math.abs(normalizedScore) * 100;

    if (volumeConfirmation) {
      confidence = Math.min(confidence * 1.2, 100);
    }

    // Penalizar si hay señales mixtas en los nuevos indicadores
    const contradictorySignals = this.detectContradictorySignals(
      rsi, stochastic, williamsR, bollingerBands
    );
    if (contradictorySignals > 1) {
      confidence *= 0.8; // Reducir confianza si hay señales contradictorias
    }

    // Bonificar si múltiples indicadores confirman la dirección
    const confirmingSignals = this.countConfirmingSignals(
      rsi, stochastic, williamsR, bollingerBands, normalizedScore > 0
    );
    if (confirmingSignals >= 3) {
      confidence = Math.min(confidence * 1.15, 100);
    }

    // Determinar señal general
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

    const result: TechnicalAnalysisResult = {
      symbol,
      timestamp: new Date().toISOString(),
      currentPrice,
      rsi: rsi,
      macd: macd,
      vwap: vwap,
      obv: obv,
      mfi: mfi,
      cmf: cmf,
      movingAverages: { ma20, ma50, ma200 },
      bollingerBands: bollingerBands,
      stochastic: stochastic,
      williamsR: williamsR,
      overallSignal,
      confidence: Math.round(confidence),
      volumeConfirmation,
      volatilityLevel
    };

    if (outputMode === 'full_data') {
      result.rsiData = rsiData;
      result.macdData = macdData;
      result.ma20Data = ma20Data;
      result.ma50Data = ma50Data;
      result.ma200Data = ma200Data;
      result.vwapData = vwapData;
      result.obvData = obvData;
      result.mfiData = mfiData;
      result.cmfData = cmfData;
      result.bollingerBandsData = bollingerBandsData;
      result.stochasticData = stochasticData;
      result.williamsRData = williamsRData;
    }

    return result;
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

  /**
   * Detecta señales contradictorias entre los indicadores de momentum
   */
  private static detectContradictorySignals(
    rsi: RSIResult,
    stochastic: StochasticResult,
    williamsR: WilliamsRResult,
    bollingerBands: BollingerBandsResult
  ): number {
    let contradictions = 0;

    // Crear array de señales para facilitar comparación
    const signals = [
      { name: 'RSI', signal: rsi.signal },
      { name: 'Stochastic', signal: stochastic.signal },
      { name: 'Williams', signal: williamsR.signal },
      { name: 'BB', signal: bollingerBands.signal }
    ];

    // Contar señales oversold vs overbought
    const oversoldCount = signals.filter(s => s.signal === 'OVERSOLD').length;
    const overboughtCount = signals.filter(s => s.signal === 'OVERBOUGHT').length;

    // Si hay mezcla significativa de señales opuestas, es contradictorio
    if (oversoldCount > 0 && overboughtCount > 0) {
      contradictions += Math.min(oversoldCount, overboughtCount);
    }

    // Verificar divergencias contradictorias
    const divergences = [
      stochastic.divergence,
      williamsR.divergence
    ].filter(d => d !== 'NO_DIVERGENCE');

    const bullishDivergences = divergences.filter(d => d === 'BULLISH_DIVERGENCE').length;
    const bearishDivergences = divergences.filter(d => d === 'BEARISH_DIVERGENCE').length;

    if (bullishDivergences > 0 && bearishDivergences > 0) {
      contradictions += 1;
    }

    return contradictions;
  }

  /**
   * Cuenta cuántos indicadores confirman la dirección principal
   */
  private static countConfirmingSignals(
    rsi: RSIResult,
    stochastic: StochasticResult,
    williamsR: WilliamsRResult,
    bollingerBands: BollingerBandsResult,
    isBullish: boolean
  ): number {
    let confirmingSignals = 0;

    if (isBullish) {
      // Señales alcistas
      if (rsi.signal === 'OVERSOLD') confirmingSignals++;
      if (stochastic.signal === 'OVERSOLD' || stochastic.crossover === 'BULLISH_CROSSOVER') confirmingSignals++;
      if (williamsR.signal === 'OVERSOLD' || williamsR.reversal_signal === 'STRONG_REVERSAL') confirmingSignals++;
      if (bollingerBands.signal === 'OVERSOLD' || bollingerBands.squeeze_status === 'EXITING_SQUEEZE') confirmingSignals++;

      // Bonificar divergencias alcistas
      if (stochastic.divergence === 'BULLISH_DIVERGENCE') confirmingSignals++;
      if (williamsR.divergence === 'BULLISH_DIVERGENCE') confirmingSignals++;
    } else {
      // Señales bajistas
      if (rsi.signal === 'OVERBOUGHT') confirmingSignals++;
      if (stochastic.signal === 'OVERBOUGHT' || stochastic.crossover === 'BEARISH_CROSSOVER') confirmingSignals++;
      if (williamsR.signal === 'OVERBOUGHT' || williamsR.reversal_signal === 'STRONG_REVERSAL') confirmingSignals++;
      if (bollingerBands.signal === 'OVERBOUGHT') confirmingSignals++;

      // Bonificar divergencias bajistas
      if (stochastic.divergence === 'BEARISH_DIVERGENCE') confirmingSignals++;
      if (williamsR.divergence === 'BEARISH_DIVERGENCE') confirmingSignals++;
    }

    return confirmingSignals;
  }
}

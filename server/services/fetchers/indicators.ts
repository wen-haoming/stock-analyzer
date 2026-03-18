// 完整技术指标计算服务

import type { KlineData } from './stocks'

// ==================== 技术指标接口 ====================

// 均线数据
export interface MAData {
  ma5: number   // 5日均线
  ma10: number  // 10日均线
  ma20: number  // 20日均线
  ma30: number  // 30日均线
  ma60: number  // 60日均线
  ma120: number // 120日均线
  ma250: number // 250日均线
}

// MACD指标
export interface MACDData {
  dif: number    // DIF线 (快线)
  dea: number    // DEA线 (慢线)
  macd: number   // MACD柱
  signal: 'golden' | 'death' | 'neutral'
}

// RSI指标
export interface RSIData {
  rsi6: number   // 6日RSI
  rsi12: number  // 12日RSI
  rsi24: number  // 24日RSI
  signal: 'overbought' | 'oversold' | 'neutral'
}

// BOLL布林带
export interface BOLLData {
  upper: number   // 上轨
  middle: number // 中轨 (20日均线)
  lower: number   // 下轨
  position: number // 当前位置 (0-1, 0=下轨, 1=上轨)
  signal: 'upper' | 'lower' | 'middle'
}

// 成交量指标
export interface VolumeData {
  volume: number         // 当前成交量
  avgVolume5: number     // 5日均量
  avgVolume10: number    // 10日均量
  volumeRatio: number    // 量比
  volumeChange: number   // 成交量变化率
  turnover: number      // 换手率
  signal: 'up' | 'down' | 'neutral'
}

// 完整技术分析结果
export interface TechnicalIndicators {
  // 均线
  ma: MAData
  maTrend: 'up' | 'down' | 'sideways'  // 均线多头/空头/横盘
  maCorrelation: number  // 均线与股价相关度
  
  // MACD
  macd: MACDData
  macdCorrelation: number  // MACD与股价相关度
  
  // RSI
  rsi: RSIData
  rsiCorrelation: number  // RSI与股价相关度
  
  // 布林带
  boll: BOLLData
  bollCorrelation: number  // 布林带与股价相关度
  
  // 成交量
  volume: VolumeData
  volumeCorrelation: number  // 成交量与股价相关度
  
  // KDJ
  kdj: {
    k: number
    d: number
    j: number
    signal: 'golden' | 'death' | 'neutral'
  }
  kdjCorrelation: number  // KDJ与股价相关度
  
  // 威廉指标
  wr: number
  wrSignal: 'overbought' | 'oversold' | 'neutral'
  
  // CCI顺势指标
  cci: number
  cciSignal: 'overbought' | 'oversold' | 'neutral'
  
  // DMA指标
  dma: {
    diff: number
    dd: number
  }
  
  // VR情绪指标
  vr: number
  vrSignal: 'high' | 'low' | 'neutral'
  
  // 综合评分
  overallScore: number  // 0-100
  overallSignal: 'buy' | 'sell' | 'neutral'
}

// 财务指标
export interface FinancialMetrics {
  pe: number        // 市盈率
  pb: number        // 市净率
  dividend: number   // 股息率
  roe: number       // 净资产收益率
  roa: number       // 资产收益率
  debtRatio: number  // 资产负债率
  currentRatio: number // 流动比率
  quickRatio: number  // 速动比率
  revenueGrowth: number  // 营收增长率
  profitGrowth: number   // 净利润增长率
  grossMargin: number   // 毛利率
  netMargin: number     // 净利率
}

// 完整分析因素
export interface AnalysisFactor {
  category: 'technical' | 'financial' | 'capital' | 'macro' | 'industry' | 'news' | 'sentiment'
  name: string
  value: number | string
  weight: number        // 权重
  correlation: number   // 与股价相关度 (-1 到 1)
  direction: 'positive' | 'negative' | 'neutral'
  signal: string       // 信号描述
  description: string  // 详细说明
}

// ==================== 均线计算 ====================

export function calculateMA(klineData: KlineData[]): MAData {
  const closes = klineData.map(d => d.close)
  
  const sma = (period: number): number => {
    if (closes.length < period) return 0
    return closes.slice(-period).reduce((a, b) => a + b, 0) / period
  }
  
  return {
    ma5: sma(5),
    ma10: sma(10),
    ma20: sma(20),
    ma30: sma(30),
    ma60: sma(60),
    ma120: sma(120),
    ma250: sma(250),
  }
}

// 计算均线与股价的相关度
export function calculateMACorrelation(klineData: KlineData[]): number {
  if (klineData.length < 10) return 0
  
  const closes = klineData.map(d => d.close)
  const ma5 = calculateMA(klineData).ma5
  
  // 简化的相关度计算：MA5与价格的偏离度
  const deviation = Math.abs(closes[closes.length - 1] - ma5) / ma5
  return Math.max(0, 1 - deviation * 10)  // 偏离越小，相关度越高
}

// ==================== MACD计算 ====================

export function calculateMACD(klineData: KlineData[], fast = 12, slow = 26, signal = 9): MACDData {
  const closes = klineData.map(d => d.close)
  if (closes.length < slow) {
    return { dif: 0, dea: 0, macd: 0, signal: 'neutral' }
  }
  
  // 计算EMA
  const ema = (period: number, data: number[]): number => {
    const k = 2 / (period + 1)
    let ema = data[0]
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k)
    }
    return ema
  }
  
  const fastEMA = ema(fast, closes)
  const slowEMA = ema(slow, closes)
  const dif = fastEMA - slowEMA
  
  // 计算DEA (信号线)
  const dea = ema(signal, [dif])
  const macd = (dif - dea) * 2
  
  let signalType: MACDData['signal'] = 'neutral'
  const prevDif = dif - (dif - dea) * 0.1  // 简化前一个值
  if (prevDif < dea && dif > dea) signalType = 'golden'
  else if (prevDif > dea && dif < dea) signalType = 'death'
  
  return { dif, dea, macd, signal: signalType }
}

// 计算MACD与股价相关度
export function calculateMACDCorrelation(klineData: KlineData[]): number {
  if (klineData.length < 30) return 0
  
  const macd = calculateMACD(klineData)
  // MACD柱状图与涨跌幅的相关度
  const priceChange = (klineData[klineData.length - 1].close - klineData[klineData.length - 2].close) / klineData[klineData.length - 2].close
  
  if (macd.macd > 0 && priceChange > 0) return 0.7
  if (macd.macd < 0 && priceChange < 0) return 0.7
  return 0.2
}

// ==================== RSI计算 ====================

export function calculateRSI(klineData: KlineData[], period = 14): RSIData {
  const closes = klineData.map(d => d.close)
  if (closes.length < period + 1) {
    return { rsi6: 50, rsi12: 50, rsi24: 50, signal: 'neutral' }
  }
  
  const rsiCalc = (p: number): number => {
    let gains = 0, losses = 0
    for (let i = closes.length - p; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }
    const avgGain = gains / p
    const avgLoss = losses / p
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }
  
  const rsi6 = rsiCalc(6)
  const rsi12 = rsiCalc(12)
  const rsi24 = rsiCalc(24)
  
  let signal: RSIData['signal'] = 'neutral'
  if (rsi6 > 80 || rsi12 > 80) signal = 'overbought'
  else if (rsi6 < 20 || rsi12 < 20) signal = 'oversold'
  
  return { rsi6, rsi12, rsi24, signal }
}

// 计算RSI与股价相关度
export function calculateRSICorrelation(klineData: KlineData[]): number {
  const rsi = calculateRSI(klineData)
  const latestPrice = klineData[klineData.length - 1].close
  const prevPrice = klineData[klineData.length - 2].close
  const priceChange = (latestPrice - prevPrice) / prevPrice
  
  // RSI超买超卖与反向的相关度
  if (rsi.rsi6 > 70 && priceChange > 0) return -0.6  // 超买可能反转
  if (rsi.rsi6 < 30 && priceChange < 0) return -0.6  // 超卖可能反转
  return 0.3
}

// ==================== 布林带计算 ====================

export function calculateBOLL(klineData: KlineData[], period = 20): BOLLData {
  const closes = klineData.map(d => d.close)
  if (closes.length < period) {
    return { upper: 0, middle: 0, lower: 0, position: 0.5, signal: 'middle' }
  }
  
  const recent = closes.slice(-period)
  const middle = recent.reduce((a, b) => a + b, 0) / period
  
  // 计算标准差
  const variance = recent.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period
  const std = Math.sqrt(variance)
  
  const upper = middle + 2 * std
  const lower = middle - 2 * std
  
  const latestClose = closes[closes.length - 1]
  const position = (latestClose - lower) / (upper - lower)
  
  let signal: BOLLData['signal'] = 'middle'
  if (position > 0.9) signal = 'upper'
  else if (position < 0.1) signal = 'lower'
  
  return { upper, middle, lower, position, signal }
}

// 计算布林带与股价相关度
export function calculateBOLLCorrelation(klineData: KlineData[]): number {
  const boll = calculateBOLL(klineData)
  // 股价在布林带中的位置越极端，相关度越强
  return Math.abs(boll.position - 0.5) * 2  // 0-1范围
}

// ==================== 成交量指标 ====================

export function calculateVolume(klineData: KlineData[]): VolumeData {
  if (klineData.length < 10) {
    return {
      volume: 0, avgVolume5: 0, avgVolume10: 0, volumeRatio: 0, 
      volumeChange: 0, turnover: 0, signal: 'neutral'
    }
  }
  
  const volumes = klineData.map(d => d.volume)
  const latestVolume = volumes[volumes.length - 1]
  const avgVolume5 = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5
  const avgVolume10 = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10
  
  const volumeRatio = avgVolume5 / avgVolume10
  const volumeChange = (latestVolume - avgVolume5) / avgVolume5
  
  const turnover = klineData[klineData.length - 1].turnover || 0
  
  let signal: VolumeData['signal'] = 'neutral'
  if (volumeRatio > 1.5 && volumeChange > 0.3) signal = 'up'
  else if (volumeRatio < 0.5) signal = 'down'
  
  return {
    volume: latestVolume,
    avgVolume5,
    avgVolume10,
    volumeRatio,
    volumeChange,
    turnover,
    signal,
  }
}

// 计算成交量与股价相关度
export function calculateVolumeCorrelation(klineData: KlineData[]): number {
  if (klineData.length < 5) return 0
  
  const volumes = klineData.map(d => d.volume)
  const closes = klineData.map(d => d.close)
  
  // 计算简单相关度
  let n = volumes.length - 1
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  
  for (let i = 1; i < volumes.length; i++) {
    const x = volumes[i] - volumes[i - 1]
    const y = closes[i] - closes[i - 1]
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  }
  
  const denominator = Math.sqrt(sumX2 * sumY2)
  if (denominator === 0) return 0
  
  return sumXY / denominator
}

// ==================== KDJ计算 ====================

export function calculateKDJSimple(klineData: KlineData[], period = 9): {
  k: number; d: number; j: number; signal: 'golden' | 'death' | 'neutral'
} {
  if (klineData.length < period) {
    return { k: 50, d: 50, j: 50, signal: 'neutral' }
  }
  
  const rsv: number[] = []
  for (let i = period - 1; i < klineData.length; i++) {
    const slice = klineData.slice(i - period + 1, i + 1)
    const low = Math.min(...slice.map(d => d.low))
    const high = Math.max(...slice.map(d => d.high))
    const close = klineData[i].close
    
    if (high === low) {
      rsv.push(50)
    } else {
      rsv.push(((close - low) / (high - low)) * 100)
    }
  }
  
  let k = 50, d = 50
  for (const r of rsv) {
    k = (2/3) * k + (1/3) * r
    d = (2/3) * d + (1/3) * k
  }
  const j = 3 * k - 2 * d
  
  let signal: 'golden' | 'death' | 'neutral' = 'neutral'
  if (rsv.length >= 2) {
    const prevK = k - (k - rsv[rsv.length - 1]) * 0.2
    const prevD = d - (d - (2/3 * d + 1/3 * k)) * 0.2
    if (prevK < prevD && k > d) signal = 'golden'
    else if (prevK > prevD && k < d) signal = 'death'
  }
  
  return { k, d, j, signal }
}

// ==================== 威廉指标 ====================

export function calculateWR(klineData: KlineData[], period = 14): { wr: number; signal: 'overbought' | 'oversold' | 'neutral' } {
  if (klineData.length < period) {
    return { wr: -50, signal: 'neutral' }
  }
  
  const recent = klineData.slice(-period)
  const highestHigh = Math.max(...recent.map(d => d.high))
  const lowestLow = Math.min(...recent.map(d => d.low))
  const close = klineData[klineData.length - 1].close
  
  const wr = ((highestHigh - close) / (highestHigh - lowestLow)) * -100
  
  let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral'
  if (wr > -20) signal = 'overbought'
  else if (wr < -80) signal = 'oversold'
  
  return { wr, signal }
}

// ==================== CCI指标 ====================

export function calculateCCI(klineData: KlineData[], period = 14): { cci: number; signal: 'overbought' | 'oversold' | 'neutral' } {
  if (klineData.length < period) {
    return { cci: 0, signal: 'neutral' }
  }
  
  const recent = klineData.slice(-period)
  const typicalPrices = recent.map(d => (d.high + d.low + d.close) / 3)
  const sma = typicalPrices.reduce((a, b) => a + b, 0) / period
  
  const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period
  const cci = (typicalPrices[typicalPrices.length - 1] - sma) / (0.015 * meanDeviation)
  
  let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral'
  if (cci > 100) signal = 'overbought'
  else if (cci < -100) signal = 'oversold'
  
  return { cci, signal }
}

// ==================== VR情绪指标 ====================

export function calculateVR(klineData: KlineData[], period = 26): { vr: number; signal: 'high' | 'low' | 'neutral' } {
  if (klineData.length < period) {
    return { vr: 100, signal: 'neutral' }
  }
  
  let upVolume = 0, downVolume = 0
  for (let i = klineData.length - period; i < klineData.length; i++) {
    if (klineData[i].close >= klineData[i].open) {
      upVolume += klineData[i].volume
    } else {
      downVolume += klineData[i].volume
    }
  }
  
  const vr = downVolume === 0 ? 100 : (upVolume / downVolume) * 100
  
  let signal: 'high' | 'low' | 'neutral' = 'neutral'
  if (vr > 150) signal = 'high'
  else if (vr < 70) signal = 'low'
  
  return { vr, signal }
}

// ==================== 完整技术分析 ====================

export function calculateAllIndicators(klineData: KlineData[]): TechnicalIndicators {
  const ma = calculateMA(klineData)
  const macd = calculateMACD(klineData)
  const rsi = calculateRSI(klineData)
  const boll = calculateBOLL(klineData)
  const volume = calculateVolume(klineData)
  const kdj = calculateKDJSimple(klineData)
  const wr = calculateWR(klineData)
  const cci = calculateCCI(klineData)
  const vr = calculateVR(klineData)
  
  // 均线趋势
  let maTrend: 'up' | 'down' | 'sideways' = 'sideways'
  if (ma.ma5 > ma.ma10 && ma.ma10 > ma.ma20 && ma.ma20 > ma.ma30) {
    maTrend = 'up'
  } else if (ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20 && ma.ma20 < ma.ma30) {
    maTrend = 'down'
  }
  
  // 综合评分
  let score = 50
  if (maTrend === 'up') score += 10
  else if (maTrend === 'down') score -= 10
  
  if (macd.signal === 'golden') score += 10
  else if (macd.signal === 'death') score -= 10
  
  if (rsi.signal === 'oversold') score += 10
  else if (rsi.signal === 'overbought') score -= 10
  
  if (boll.signal === 'lower') score += 10
  else if (boll.signal === 'upper') score -= 10
  
  if (volume.signal === 'up') score += 10
  
  const overallSignal: 'buy' | 'sell' | 'neutral' = score > 60 ? 'buy' : score < 40 ? 'sell' : 'neutral'
  
  return {
    ma,
    maTrend,
    maCorrelation: calculateMACorrelation(klineData),
    macd,
    macdCorrelation: calculateMACDCorrelation(klineData),
    rsi,
    rsiCorrelation: calculateRSICorrelation(klineData),
    boll,
    bollCorrelation: calculateBOLLCorrelation(klineData),
    volume,
    volumeCorrelation: calculateVolumeCorrelation(klineData),
    kdj,
    kdjCorrelation: 0.6,
    wr: wr.wr,
    wrSignal: wr.signal,
    cci: cci.cci,
    cciSignal: cci.signal,
    dma: { diff: 0, dd: 0 },
    vr: vr.vr,
    vrSignal: vr.signal,
    overallScore: Math.max(0, Math.min(100, score)),
    overallSignal,
  }
}

// ==================== 生成完整分析因素列表 ====================

export function generateAllFactors(
  technical: TechnicalIndicators,
  financial: Partial<FinancialMetrics>,
  capital: { netInflow: number; largeRatio: number },
  macro: { gdp: number; cpi: number },
  news: { positive: number; negative: number }
): AnalysisFactor[] {
  const factors: AnalysisFactor[] = []
  
  // 1. 技术指标因素
  factors.push({
    category: 'technical',
    name: '均线多头排列',
    value: technical.maTrend,
    weight: 15,
    correlation: technical.maCorrelation,
    direction: technical.maTrend === 'up' ? 'positive' : technical.maTrend === 'down' ? 'negative' : 'neutral',
    signal: technical.maTrend === 'up' ? '买入信号' : technical.maTrend === 'down' ? '卖出信号' : '观望',
    description: technical.ma.ma5 > technical.ma.ma10 ? '5日均线在10日均线上方' : '均线呈多头排列',
  })
  
  factors.push({
    category: 'technical',
    name: 'MACD金叉/死叉',
    value: technical.macd.signal,
    weight: 12,
    correlation: technical.macdCorrelation,
    direction: technical.macd.signal === 'golden' ? 'positive' : technical.macd.signal === 'death' ? 'negative' : 'neutral',
    signal: technical.macd.signal === 'golden' ? '金叉买入' : technical.macd.signal === 'death' ? '死叉卖出' : '观望',
    description: `DIF=${technical.macd.dif.toFixed(2)}, DEA=${technical.macd.dea.toFixed(2)}`,
  })
  
  factors.push({
    category: 'technical',
    name: 'RSI超买超卖',
    value: technical.rsi.rsi6.toFixed(1),
    weight: 10,
    correlation: technical.rsiCorrelation,
    direction: technical.rsi.signal === 'oversold' ? 'positive' : technical.rsi.signal === 'overbought' ? 'negative' : 'neutral',
    signal: technical.rsi.signal === 'oversold' ? '超卖可能反弹' : technical.rsi.signal === 'overbought' ? '超买注意风险' : '正常区间',
    description: `RSI(6)=${technical.rsi.rsi6.toFixed(1)}, RSI(12)=${technical.rsi.rsi12.toFixed(1)}`,
  })
  
  factors.push({
    category: 'technical',
    name: '布林带位置',
    value: (technical.boll.position * 100).toFixed(1) + '%',
    weight: 10,
    correlation: technical.bollCorrelation,
    direction: technical.boll.signal === 'lower' ? 'positive' : technical.boll.signal === 'upper' ? 'negative' : 'neutral',
    signal: technical.boll.signal === 'lower' ? '触及下轨可能反弹' : technical.boll.signal === 'upper' ? '触及上轨注意回落' : '中轨附近震荡',
    description: `上轨=${technical.boll.upper.toFixed(2)}, 下轨=${technical.boll.lower.toFixed(2)}`,
  })
  
  factors.push({
    category: 'technical',
    name: '成交量异动',
    value: technical.volume.volumeRatio.toFixed(2),
    weight: 12,
    correlation: technical.volumeCorrelation,
    direction: technical.volume.signal === 'up' ? 'positive' : technical.volume.signal === 'down' ? 'negative' : 'neutral',
    signal: technical.volume.signal === 'up' ? '放量上涨' : technical.volume.signal === 'down' ? '缩量下跌' : '成交量正常',
    description: `量比=${technical.volume.volumeRatio.toFixed(2)}, 换手率=${technical.volume.turnover?.toFixed(2)}%`,
  })
  
  factors.push({
    category: 'technical',
    name: 'KDJ指标',
    value: `K=${technical.kdj.k.toFixed(1)}, D=${technical.kdj.d.toFixed(1)}, J=${technical.kdj.j.toFixed(1)}`,
    weight: 10,
    correlation: technical.kdjCorrelation,
    direction: technical.kdj.signal === 'golden' ? 'positive' : technical.kdj.signal === 'death' ? 'negative' : 'neutral',
    signal: technical.kdj.signal === 'golden' ? '金叉买入' : technical.kdj.signal === 'death' ? '死叉卖出' : '观望',
    description: 'KDJ随机指标',
  })
  
  // 2. 资金流向因素
  factors.push({
    category: 'capital',
    name: '主力资金流向',
    value: (capital.netInflow / 10000).toFixed(0) + '万',
    weight: 15,
    correlation: 0.7,
    direction: capital.netInflow > 0 ? 'positive' : capital.netInflow < 0 ? 'negative' : 'neutral',
    signal: capital.netInflow > 0 ? '主力净流入' : capital.netInflow < 0 ? '主力净流出' : '资金平衡',
    description: `主力净流入${(capital.netInflow / 10000).toFixed(0)}万元，大单占比${capital.largeRatio}%`,
  })
  
  // 3. 财务指标因素
  if (financial.pe) {
    factors.push({
      category: 'financial',
      name: '市盈率',
      value: financial.pe.toFixed(1),
      weight: 8,
      correlation: -0.3,
      direction: financial.pe < 20 ? 'positive' : financial.pe > 50 ? 'negative' : 'neutral',
      signal: financial.pe < 20 ? '估值偏低' : financial.pe > 50 ? '估值偏高' : '估值合理',
      description: `PE=${financial.pe.toFixed(1)}倍`,
    })
  }
  
  if (financial.roe) {
    factors.push({
      category: 'financial',
      name: '净资产收益率',
      value: financial.roe.toFixed(1) + '%',
      weight: 10,
      correlation: 0.6,
      direction: financial.roe > 15 ? 'positive' : financial.roe < 5 ? 'negative' : 'neutral',
      signal: financial.roe > 15 ? '盈利能力强' : financial.roe < 5 ? '盈利能力弱' : '盈利能力一般',
      description: `ROE=${financial.roe.toFixed(1)}%`,
    })
  }
  
  // 4. 宏观因素
  factors.push({
    category: 'macro',
    name: 'GDP增长率',
    value: macro.gdp.toFixed(1) + '%',
    weight: 8,
    correlation: 0.4,
    direction: macro.gdp > 5 ? 'positive' : macro.gdp < 3 ? 'negative' : 'neutral',
    signal: macro.gdp > 5 ? '经济稳健增长' : macro.gdp < 3 ? '经济增速放缓' : '经济平稳',
    description: '国内生产总值同比增长率',
  })
  
  factors.push({
    category: 'macro',
    name: 'CPI通胀率',
    value: macro.cpi.toFixed(1) + '%',
    weight: 5,
    correlation: -0.2,
    direction: macro.cpi < 3 ? 'positive' : macro.cpi > 5 ? 'negative' : 'neutral',
    signal: macro.cpi < 3 ? '通胀温和' : macro.cpi > 5 ? '通胀压力' : '通胀平稳',
    description: '居民消费价格指数',
  })
  
  // 5. 新闻舆情
  const totalNews = news.positive + news.negative
  const sentiment = totalNews > 0 ? (news.positive - news.negative) / totalNews : 0
  
  factors.push({
    category: 'news',
    name: '新闻舆情',
    value: `正${news.positive}条 / 负${news.negative}条`,
    weight: 10,
    correlation: sentiment * 0.5,
    direction: sentiment > 0.2 ? 'positive' : sentiment < -0.2 ? 'negative' : 'neutral',
    signal: sentiment > 0.2 ? '舆情偏正面' : sentiment < -0.2 ? '舆情偏负面' : '舆情中性',
    description: `正面新闻${news.positive}条，负面新闻${news.negative}条`,
  })
  
  return factors
}

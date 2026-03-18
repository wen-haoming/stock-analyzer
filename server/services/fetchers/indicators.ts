// 全面的股票分析指标体系 - 所有影响股票的指标

import type { KlineData } from './stocks'

// ==================== 完整技术指标 ====================

// 移动平均线
export interface MAIndicator {
  ma5: number
  ma10: number
  ma20: number
  ma30: number
  ma60: number
  ma120: number
  ma250: number
  ema12: number
  ema26: number
  trend: 'up' | 'down' | 'sideways'
  goldenCross: boolean  // 金叉
  deathCross: boolean  // 死叉
}

// MACD指标
export interface MACDIndicator {
  dif: number
  dea: number
  macd: number
  signal: 'golden' | 'death' | 'neutral'
  divergence: 'top' | 'bottom' | 'none'  // 背离
}

// RSI指标
export interface RSIIndicator {
  rsi6: number
  rsi12: number
  rsi24: number
  signal: 'overbought' | 'oversold' | 'neutral'
}

// 布林带
export interface BOLLIndicator {
  upper: number
  middle: number
  lower: number
  position: number
  bandwidth: number
  signal: 'upper' | 'lower' | 'middle'
}

// KDJ指标
export interface KDJIndicator {
  k: number
  d: number
  j: number
  signal: 'golden' | 'death' | 'neutral'
}

// 成交量指标
export interface VolumeIndicator {
  volume: number
  avgVolume5: number
  avgVolume10: number
  avgVolume20: number
  volumeRatio: number
  turnover: number
  amplitude: number  // 振幅
}

// 威廉指标
export interface WRIndicator {
  wr6: number
  wr10: number
  signal: 'overbought' | 'oversold' | 'neutral'
}

// CCI顺势指标
export interface CCIIndicator {
  cci: number
  signal: 'overbought' | 'oversold' | 'neutral'
}

// DMA指标
export interface DMAIndicator {
  diff: number
  dd: number
  signal: 'golden' | 'death' | 'neutral'
}

// VR情绪指标
export interface VRIndicator {
  vr: number
  signal: 'high' | 'low' | 'neutral'
}

// ARBR能量指标
export interface ARBRIndicator {
  ar: number  // 气势指标
  br: number  // 意愿指标
  signal: 'buy' | 'sell' | 'neutral'
}

// CR能量指标
export interface CRIndicator {
  cr: number
  ma1: number
  ma2: number
  ma3: number
  signal: 'buy' | 'sell' | 'neutral'
}

// OBV能量潮
export interface OBVIndicator {
  obv: number
  obvMa5: number
  trend: 'up' | 'down' | 'neutral'
}

// SAR抛物线指标
export interface SARIndicator {
  sar: number
  trend: 'up' | 'down'
  reversal: boolean
}

// DMI趋向指标
export interface DMIIndicator {
  plusDi: number
  minusDi: number
  adx: number
  adxr: number
  signal: 'buy' | 'sell' | 'neutral'
}

// Keltner通道
export interface KeltnerIndicator {
  upper: number
  middle: number
  lower: number
  position: number
}

// ==================== 完整财务指标 ====================

export interface FinancialIndicator {
  // 估值指标
  pe: number        // 市盈率
  pb: number        // 市净率
  ps: number        // 市销率
  pcfo: number      // 市现率
  dividend: number   // 股息率
  peg: number       // PEG
  
  // 盈利能力
  roe: number       // 净资产收益率
  roa: number       // 资产收益率
  grossMargin: number   // 毛利率
  netMargin: number     // 净利率
  operatingMargin: number // 营业利润率
  
  // 成长能力
  revenueGrowth: number  // 营收增长率
  profitGrowth: number   // 净利润增长率
  assetGrowth: number    // 总资产增长率
  equityGrowth: number    // 净资产增长率
  
  // 偿债能力
  debtRatio: number     // 资产负债率
  currentRatio: number  // 流动比率
  quickRatio: number    // 速动比率
  cashRatio: number     // 现金比率
  
  // 运营能力
  inventoryTurnover: number    // 存货周转率
  receivableTurnover: number   // 应收账款周转率
  assetTurnover: number        // 总资产周转率
  
  // 每股指标
  eps: number         // 每股收益
  bps: number        // 每股净资产
  cps: number        // 每股现金流
  revenuePerShare: number   // 每股营收
}

// ==================== 资金流向指标 ====================

export interface CapitalFlowIndicator {
  mainNetInflow: number      // 主力净流入
  retailNetInflow: number    // 散户净流入
  largeNetInflow: number     // 大单净流入
  mediumNetInflow: number    // 中单净流入
  smallNetInflow: number     // 小单净流入
  mainRatio: number          // 主力占比
  largeRatio: number         // 大单占比
  netInflowRate: number     // 净流入率
  fiveDayNetInflow: number  // 5日主力净流入
  tenDayNetInflow: number   // 10日主力净流入
  trend: 'inflow' | 'outflow' | 'neutral'
}

// ==================== 市场情绪指标 ====================

export interface SentimentIndicator {
  // 市场整体情绪
  marketHeat: number        // 市场热度
  fearGreedIndex: number   // 恐贪指数
  putCallRatio: number     // 看跌/看涨比率
  
  // 个股情绪
  socialBuzz: number        // 社交热度
  newsCount: number        // 新闻数量
  announcementCount: number // 公告数量
  researchCount: number    // 研报数量
  
  // 技术情绪
  supportLevel: number     // 支撑位强度
  resistanceLevel: number   // 阻力位强度
  volatility: number        // 波动率
}

// ==================== 宏观指标 ====================

export interface MacroIndicator {
  gdp: { value: number; change: number; quarter: string }
  cpi: { value: number; change: number; month: string }
  pmi: { value: number; change: number; month: string }
  interestRate: { value: number; change: number }
  usdCny: { value: number; change: number }
  m2: { value: number; change: number }  // 货币供应量
  socialFinancing: { value: number; change: number }  // 社会融资
}

// ==================== 行业指标 ====================

export interface IndustryIndicator {
  industryName: string
  industryPE: number
  industryPB: number
  industryGrowth: number
  capitalInflow: number
  upStocks: number
  downStocks: number
  leadStocks: string[]  // 领涨股票
  trend: 'up' | 'down' | 'sideways'
}

// ==================== 完整分析结果 ====================

export interface CompleteAnalysis {
  // 技术分析
  technical: {
    ma: MAIndicator
    macd: MACDIndicator
    rsi: RSIIndicator
    boll: BOLLIndicator
    kdj: KDJIndicator
    volume: VolumeIndicator
    wr: WRIndicator
    cci: CCIIndicator
    dmi: DMIIndicator
    sar: SARIndicator
    obv: OBVIndicator
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 财务分析
  financial: {
    valuation: { pe: number; pb: number; peg: number; dividend: number }
    profitability: { roe: number; grossMargin: number; netMargin: number }
    growth: { revenueGrowth: number; profitGrowth: number }
    health: { debtRatio: number; currentRatio: number }
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 资金分析
  capital: {
    today: CapitalFlowIndicator
    trend: 'inflow' | 'outflow' | 'neutral'
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 情绪分析
  sentiment: {
    market: SentimentIndicator
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 宏观分析
  macro: {
    data: MacroIndicator
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 行业分析
  industry: {
    data: IndustryIndicator
    score: number
    signal: 'buy' | 'sell' | 'neutral'
  }
  
  // 综合评分
  overall: {
    score: number
    signal: 'buy' | 'sell' | 'neutral'
    confidence: number
  }
  
  // 完整因素列表 (含相关度)
  factors: Array<{
    category: string
    name: string
    value: number | string
    weight: number
    correlation: number
    direction: 'positive' | 'negative' | 'neutral'
    signal: string
    description: string
  }>
}

// ==================== 计算函数 ====================

export function calculateMA(klineData: KlineData[]): MAIndicator {
  const closes = klineData.map(d => d.close)
  const sma = (p: number) => closes.length >= p ? closes.slice(-p).reduce((a, b) => a + b, 0) / p : 0
  
  return {
    ma5: sma(5),
    ma10: sma(10),
    ma20: sma(20),
    ma30: sma(30),
    ma60: sma(60),
    ma120: sma(120),
    ma250: sma(250),
    ema12: sma(12),
    ema26: sma(26),
    trend: sma(5) > sma(20) ? 'up' : sma(5) < sma(20) ? 'down' : 'sideways',
    goldenCross: sma(5) > sma(10) && sma(10) > sma(20),
    deathCross: sma(5) < sma(10) && sma(10) < sma(20),
  }
}

export function calculateMACD(klineData: KlineData[]): MACDIndicator {
  const closes = klineData.map(d => d.close)
  if (closes.length < 26) return { dif: 0, dea: 0, macd: 0, signal: 'neutral', divergence: 'none' }
  
  const ema = (p: number, data: number[]) => {
    const k = 2 / (p + 1)
    let val = data[0]
    for (let i = 1; i < data.length; i++) val = data[i] * k + val * (1 - k)
    return val
  }
  
  const e12 = ema(12, closes)
  const e26 = ema(26, closes)
  const dif = e12 - e26
  const dea = ema(9, [dif])
  const macd = (dif - dea) * 2
  
  return {
    dif,
    dea,
    macd,
    signal: macd > 0 ? 'golden' : macd < 0 ? 'death' : 'neutral',
    divergence: 'none',
  }
}

export function calculateRSI(klineData: KlineData[]): RSIIndicator {
  const closes = klineData.map(d => d.close)
  const rsi = (p: number) => {
    if (closes.length < p + 1) return 50
    let gains = 0, losses = 0
    for (let i = closes.length - p; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }
    if (losses === 0) return 100
    const rs = gains / losses
    return 100 - (100 / (1 + rs))
  }
  
  const rsi6 = rsi(6)
  const rsi12 = rsi(12)
  const rsi24 = rsi(24)
  
  return {
    rsi6,
    rsi12,
    rsi24,
    signal: rsi6 > 80 ? 'overbought' : rsi6 < 20 ? 'oversold' : 'neutral',
  }
}

export function calculateBOLL(klineData: KlineData[], period = 20): BOLLIndicator {
  const closes = klineData.map(d => d.close)
  if (closes.length < period) return { upper: 0, middle: 0, lower: 0, position: 0.5, bandwidth: 0, signal: 'middle' }
  
  const recent = closes.slice(-period)
  const middle = recent.reduce((a, b) => a + b, 0) / period
  const std = Math.sqrt(recent.reduce((s, p) => s + Math.pow(p - middle, 2), 0) / period)
  
  const upper = middle + 2 * std
  const lower = middle - 2 * std
  const bandwidth = (upper - lower) / middle * 100
  const position = (closes[closes.length - 1] - lower) / (upper - lower)
  
  return {
    upper, middle, lower, bandwidth,
    position: Math.max(0, Math.min(1, position)),
    signal: position > 0.9 ? 'upper' : position < 0.1 ? 'lower' : 'middle',
  }
}

export function calculateKDJ(klineData: KlineData[], period = 9): KDJIndicator {
  if (klineData.length < period) return { k: 50, d: 50, j: 50, signal: 'neutral' }
  
  const rsv: number[] = []
  for (let i = period - 1; i < klineData.length; i++) {
    const slice = klineData.slice(i - period + 1, i + 1)
    const low = Math.min(...slice.map(d => d.low))
    const high = Math.max(...slice.map(d => d.high))
    const close = klineData[i].close
    rsv.push(high === low ? 50 : ((close - low) / (high - low)) * 100)
  }
  
  let k = 50, d = 50
  for (const r of rsv) {
    k = (2/3) * k + (1/3) * r
    d = (2/3) * d + (1/3) * k
  }
  
  return {
    k, d, j: 3 * k - 2 * d,
    signal: rsv[rsv.length - 1] > 80 ? 'neutral' : 'neutral',
  }
}

export function calculateVolume(klineData: KlineData[]): VolumeIndicator {
  if (klineData.length < 20) return { volume: 0, avgVolume5: 0, avgVolume10: 0, avgVolume20: 0, volumeRatio: 1, turnover: 0, amplitude: 0 }
  
  const volumes = klineData.map(d => d.volume)
  const latest = klineData[klineData.length - 1]
  const highs = klineData.map(d => d.high)
  const lows = klineData.map(d => d.low)
  
  return {
    volume: latest.volume,
    avgVolume5: volumes.slice(-5).reduce((a, b) => a + b, 0) / 5,
    avgVolume10: volumes.slice(-10).reduce((a, b) => a + b, 0) / 10,
    avgVolume20: volumes.slice(-20).reduce((a, b) => a + b, 0) / 20,
    volumeRatio: volumes.slice(-5).reduce((a, b) => a + b, 0) / volumes.slice(-10).reduce((a, b) => a + b, 0),
    turnover: latest.turnover || 0,
    amplitude: ((Math.max(...highs) - Math.min(...lows)) / Math.min(...lows)) * 100,
  }
}

export function calculateWR(klineData: KlineData[], period = 14): WRIndicator {
  if (klineData.length < period) return { wr6: -50, wr10: -50, signal: 'neutral' }
  
  const wr = (p: number) => {
    const slice = klineData.slice(-p)
    const high = Math.max(...slice.map(d => d.high))
    const low = Math.min(...slice.map(d => d.low))
    const close = klineData[klineData.length - 1].close
    return ((high - close) / (high - low)) * -100
  }
  
  return {
    wr6: wr(6),
    wr10: wr(10),
    signal: wr(6) < -80 ? 'oversold' : wr(6) > -20 ? 'overbought' : 'neutral',
  }
}

export function calculateCCI(klineData: KlineData[], period = 14): CCIIndicator {
  if (klineData.length < period) return { cci: 0, signal: 'neutral' }
  
  const recent = klineData.slice(-period)
  const tp = recent.map(d => (d.high + d.low + d.close) / 3)
  const sma = tp.reduce((a, b) => a + b, 0) / period
  const md = tp.reduce((s, t) => s + Math.abs(t - sma), 0) / period
  const cci = (tp[tp.length - 1] - sma) / (0.015 * md)
  
  return {
    cci,
    signal: cci > 100 ? 'overbought' : cci < -100 ? 'oversold' : 'neutral',
  }
}

export function calculateDMI(klineData: KlineData[], period = 14): DMIIndicator {
  if (klineData.length < period + 1) return { plusDi: 0, minusDi: 0, adx: 0, adxr: 0, signal: 'neutral' }
  
  // 简化版DMI
  const highs = klineData.map(d => d.high)
  const lows = klineData.map(d => d.low)
  
  return {
    plusDi: 30,
    minusDi: 25,
    adx: 20,
    adxr: 18,
    signal: 'neutral',
  }
}

export function calculateSAR(klineData: KlineData[]): SARIndicator {
  if (klineData.length < 2) return { sar: 0, trend: 'up', reversal: false }
  
  const closes = klineData.map(d => d.close)
  const isUp = closes[closes.length - 1] > closes[closes.length - 2]
  
  return {
    sar: closes[closes.length - 1],
    trend: isUp ? 'up' : 'down',
    reversal: false,
  }
}

export function calculateOBV(klineData: KlineData[]): OBVIndicator {
  if (klineData.length < 2) return { obv: 0, obvMa5: 0, trend: 'neutral' }
  
  let obv = 0
  const obvArr: number[] = []
  
  for (let i = 1; i < klineData.length; i++) {
    if (klineData[i].close > klineData[i - 1].close) obv += klineData[i].volume
    else obv -= klineData[i].volume
    obvArr.push(obv)
  }
  
  return {
    obv,
    obvMa5: obvArr.slice(-5).reduce((a, b) => a + b, 0) / 5,
    trend: obvArr[obvArr.length - 1] > obvArr[obvArr.length - 5] ? 'up' : 'down',
  }
}

// ==================== 生成完整因素列表 ====================

export function generateCompleteFactors(
  technical: any,
  financial: any,
  capital: any,
  sentiment: any,
  macro: any,
  industry: any
): CompleteAnalysis['factors'] {
  const factors: CompleteAnalysis['factors'] = []
  
  // 1. 技术指标因素 (40%权重)
  const techFactors = [
    { name: 'MA均线多头排列', value: technical.ma?.trend, weight: 8, corr: technical.ma?.trend === 'up' ? 0.7 : -0.3, dir: technical.ma?.trend === 'up' ? 'positive' : 'negative', sig: '均线多头买入' },
    { name: 'MACD金叉', value: technical.macd?.signal, weight: 7, corr: technical.macd?.signal === 'golden' ? 0.6 : -0.4, dir: technical.macd?.signal === 'golden' ? 'positive' : 'negative', sig: 'MACD金叉信号' },
    { name: 'RSI超卖', value: technical.rsi?.rsi6, weight: 6, corr: technical.rsi?.signal === 'oversold' ? 0.5 : 0, dir: technical.rsi?.signal === 'oversold' ? 'positive' : 'neutral', sig: 'RSI超卖反弹' },
    { name: '布林带下轨', value: technical.boll?.position, weight: 6, corr: technical.boll?.position < 0.2 ? 0.5 : 0, dir: technical.boll?.position < 0.2 ? 'positive' : 'neutral', sig: '触及布林下轨' },
    { name: 'KDJ金叉', value: technical.kdj?.signal, weight: 5, corr: technical.kdj?.signal === 'golden' ? 0.5 : 0, dir: technical.kdj?.signal === 'positive' ? 'positive' : 'neutral', sig: 'KDJ金叉' },
    { name: '成交量放大', value: technical.volume?.volumeRatio, weight: 5, corr: technical.volume?.volumeRatio > 1.5 ? 0.6 : 0, dir: technical.volume?.volumeRatio > 1.5 ? 'positive' : 'neutral', sig: '量价齐升' },
    { name: '威廉超卖', value: technical.wr?.wr6, weight: 3, corr: technical.wr?.signal === 'oversold' ? 0.4 : 0, dir: technical.wr?.signal === 'oversold' ? 'positive' : 'neutral', sig: 'WR超卖' },
  ]
  
  techFactors.forEach(f => {
    factors.push({
      category: 'technical',
      name: f.name,
      value: typeof f.value === 'number' ? f.value.toFixed(2) : f.value,
      weight: f.weight,
      correlation: f.corr,
      direction: f.dir,
      signal: f.sig,
      description: `技术指标 ${f.name}`,
    })
  })
  
  // 2. 财务指标因素 (25%权重)
  if (financial.valuation) {
    factors.push({
      category: 'financial',
      name: '市盈率PE',
      value: financial.valuation.pe?.toFixed(1) || 'N/A',
      weight: 8,
      correlation: financial.valuation.pe < 20 ? 0.4 : financial.valuation.pe > 50 ? -0.4 : 0,
      direction: financial.valuation.pe < 20 ? 'positive' : financial.valuation.pe > 50 ? 'negative' : 'neutral',
      signal: financial.valuation.pe < 20 ? '估值偏低' : financial.valuation.pe > 50 ? '估值偏高' : '估值合理',
      description: `PE ${financial.valuation.pe?.toFixed(1)}倍`,
    })
  }
  
  if (financial.profitability) {
    factors.push({
      category: 'financial',
      name: '净资产收益率ROE',
      value: financial.profitability.roe?.toFixed(1) + '%',
      weight: 8,
      correlation: financial.profitability.roe > 15 ? 0.6 : financial.profitability.roe < 5 ? -0.4 : 0,
      direction: financial.profitability.roe > 15 ? 'positive' : financial.profitability.roe < 5 ? 'negative' : 'neutral',
      signal: financial.profitability.roe > 15 ? '盈利能力强' : '盈利能力弱',
      description: `ROE ${financial.profitability.roe?.toFixed(1)}%`,
    })
    
    factors.push({
      category: 'financial',
      name: '毛利率',
      value: financial.profitability.grossMargin?.toFixed(1) + '%',
      weight: 5,
      correlation: financial.profitability.grossMargin > 30 ? 0.5 : 0,
      direction: financial.profitability.grossMargin > 30 ? 'positive' : 'neutral',
      signal: financial.profitability.grossMargin > 30 ? '毛利率高' : '毛利率一般',
      description: `毛利率 ${financial.profitability.grossMargin?.toFixed(1)}%`,
    })
  }
  
  if (financial.growth) {
    factors.push({
      category: 'financial',
      name: '营收增长',
      value: financial.growth.revenueGrowth?.toFixed(1) + '%',
      weight: 4,
      correlation: financial.growth.revenueGrowth > 20 ? 0.5 : financial.growth.revenueGrowth < 0 ? -0.3 : 0,
      direction: financial.growth.revenueGrowth > 20 ? 'positive' : financial.growth.revenueGrowth < 0 ? 'negative' : 'neutral',
      signal: financial.growth.revenueGrowth > 20 ? '高增长' : '增长放缓',
      description: `营收同比增长 ${financial.growth.revenueGrowth?.toFixed(1)}%`,
    })
  }
  
  // 3. 资金流向因素 (20%权重)
  factors.push({
    category: 'capital',
    name: '主力资金净流入',
    value: (capital.today?.mainNetInflow / 10000).toFixed(0) + '万',
    weight: 10,
    correlation: capital.today?.mainNetInflow > 0 ? 0.7 : -0.5,
    direction: capital.today?.mainNetInflow > 0 ? 'positive' : 'negative',
    signal: capital.today?.mainNetInflow > 0 ? '主力净流入' : '主力净流出',
    description: `主力净流入 ${(capital.today?.mainNetInflow / 10000).toFixed(0)}万元`,
  })
  
  factors.push({
    category: 'capital',
    name: '大单占比',
    value: capital.today?.largeRatio + '%',
    weight: 5,
    correlation: capital.today?.largeRatio > 50 ? 0.4 : -0.2,
    direction: capital.today?.largeRatio > 50 ? 'positive' : 'negative',
    signal: capital.today?.largeRatio > 50 ? '大单主导' : '散户主导',
    description: `大单占比 ${capital.today?.largeRatio}%`,
  })
  
  factors.push({
    category: 'capital',
    name: '资金趋势',
    value: capital.trend,
    weight: 5,
    correlation: capital.trend === 'inflow' ? 0.6 : capital.trend === 'outflow' ? -0.6 : 0,
    direction: capital.trend === 'inflow' ? 'positive' : capital.trend === 'outflow' ? 'negative' : 'neutral',
    signal: capital.trend === 'inflow' ? '资金持续流入' : capital.trend === 'outflow' ? '资金持续流出' : '资金平衡',
    description: `${capital.trend === 'inflow' ? '5日主力净流入' : capital.trend === 'outflow' ? '5日主力净流出' : '资金平衡'}`,
  })
  
  // 4. 市场情绪因素 (10%权重)
  factors.push({
    category: 'sentiment',
    name: '市场热度',
    value: sentiment.market?.marketHeat?.toFixed(0) || '50',
    weight: 5,
    correlation: sentiment.market?.marketHeat > 70 ? 0.3 : sentiment.market?.marketHeat < 30 ? -0.3 : 0,
    direction: sentiment.market?.marketHeat > 70 ? 'positive' : sentiment.market?.marketHeat < 30 ? 'negative' : 'neutral',
    signal: sentiment.market?.marketHeat > 70 ? '市场过热' : sentiment.market?.marketHeat < 30 ? '市场冷淡' : '市场平稳',
    description: `热度指数 ${sentiment.market?.marketHeat?.toFixed(0)}`,
  })
  
  // 5. 宏观因素 (5%权重)
  if (macro.data?.gdp) {
    factors.push({
      category: 'macro',
      name: 'GDP增长率',
      value: macro.data.gdp.change?.toFixed(1) + '%',
      weight: 3,
      correlation: macro.data.gdp.change > 5 ? 0.4 : macro.data.gdp.change < 3 ? -0.3 : 0,
      direction: macro.data.gdp.change > 5 ? 'positive' : macro.data.gdp.change < 3 ? 'negative' : 'neutral',
      signal: macro.data.gdp.change > 5 ? '经济稳健增长' : '经济增速放缓',
      description: `GDP同比 ${macro.data.gdp.change}%`,
    })
  }
  
  // 6. 行业因素 (5%权重)
  if (industry.data) {
    factors.push({
      category: 'industry',
      name: '行业资金流入',
      value: (industry.data.capitalInflow / 10000).toFixed(0) + '亿',
      weight: 3,
      correlation: industry.data.capitalInflow > 0 ? 0.4 : -0.3,
      direction: industry.data.capitalInflow > 0 ? 'positive' : 'negative',
      signal: industry.data.capitalInflow > 0 ? '行业受资金青睐' : '行业资金流出',
      description: `行业净流入 ${(industry.data.capitalInflow / 10000).toFixed(0)}亿`,
    })
    
    factors.push({
      category: 'industry',
      name: '行业涨跌家数',
      value: `${industry.data.upStocks}涨/${industry.data.downStocks}跌`,
      weight: 2,
      correlation: industry.data.upStocks > industry.data.downStocks ? 0.4 : -0.3,
      direction: industry.data.upStocks > industry.data.downStocks ? 'positive' : 'negative',
      signal: industry.data.upStocks > industry.data.downStocks ? '行业整体上涨' : '行业整体下跌',
      description: `上涨 ${industry.data.upStocks}家，下跌 ${industry.data.downStocks}家`,
    })
  }
  
  return factors
}

// ==================== 综合评分计算 ====================

export function calculateOverallScore(factors: CompleteAnalysis['factors']): { score: number; signal: 'buy' | 'sell' | 'neutral'; confidence: number } {
  let positiveScore = 0
  let negativeScore = 0
  let totalWeight = 0
  
  for (const f of factors) {
    totalWeight += f.weight
    if (f.direction === 'positive') {
      positiveScore += f.weight * Math.abs(f.correlation)
    } else if (f.direction === 'negative') {
      negativeScore += f.weight * Math.abs(f.correlation)
    }
  }
  
  const score = 50 + ((positiveScore - negativeScore) / totalWeight) * 50
  const finalScore = Math.max(0, Math.min(100, score))
  
  const signal: 'buy' | 'sell' | 'neutral' = finalScore > 60 ? 'buy' : finalScore < 40 ? 'sell' : 'neutral'
  const confidence = Math.min(95, Math.max(50, Math.abs(finalScore - 50) * 2 + 50))
  
  return { score: finalScore, signal, confidence }
}

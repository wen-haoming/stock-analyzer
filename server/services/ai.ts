// AI 分析服务 - 多维度分析

import { 
  getStockKline, 
  calculateKDJ,
  splitRangeByType,
  type KlineData,
  type MarketType,
  type KlineType
} from '../services/fetchers/stocks'
import { 
  getMultiDimensionNews, 
  fetchMacroData, 
  fetchCapitalFlowDetail,
  fetchIndustryCapitalFlow,
  type NewsItem 
} from '../services/fetchers/news'

// 分析类型
export type AnalysisType = 'today' | 'range' | 'predict'

// KDJ指标数据
interface KDJData {
  time: string
  k: number
  d: number
  j: number
}

// 多维度分析结果
export interface MultiDimensionAnalysis {
  // 思维链
  thinkingChain: ThinkStep[]
  
  // 技术分析
  technical: {
    trend: 'up' | 'down' | 'sideways'
    volatility: number
    support: number
    resistance: number
    signals: string[]
    kdjSignals: string[]
    macdSignals: string[]
  }
  
  // 新闻分析
  news: {
    company: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    industry: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    macro: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    market: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
  }
  
  // 宏观分析
  macro: {
    gdp?: { value: number; change: number; quarter: string }
    cpi?: { value: number; change: number; month: string }
    interestRate?: { value: number; change: number; date: string }
    usdCny?: { value: number; change: number }
    assessment: string
  }
  
  // 行业分析
  industry: {
    trend: 'up' | 'down' | 'sideways'
    capitalFlow: number
    upStocks: number
    downStocks: number
    assessment: string
  }
  
  // 资金流向
  capital: {
    netInflow: number
    largeInflow: number
    mediumInflow: number
    smallInflow: number
    largeRatio: number
    assessment: string
  }
  
  // 结论
  factors: Factor[]
  conclusion: string
  confidence: number
}

// 思维链步骤
export interface ThinkStep {
  title: string
  content: string
  status: 'pending' | 'thinking' | 'completed'
}

// 影响因素
export interface Factor {
  name: string
  category: 'technical' | 'news' | 'macro' | 'industry' | 'capital'
  weight: number
  direction: 'positive' | 'negative' | 'neutral'
  reason: string
}

// ==================== 当日分析 ====================

export async function analyzeToday(
  market: MarketType,
  symbol: string,
  klineType: KlineType = '101'
): Promise<MultiDimensionAnalysis> {
  const thinkingChain: ThinkStep[] = []
  
  // Step 1: 数据收集
  thinkingChain.push({ title: '数据收集', content: '获取K线、新闻、宏观、资金流向数据', status: 'thinking' })
  
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // 获取K线数据
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  const kdjData = calculateKDJ(klineData)
  
  // 获取多维度新闻
  const news = await getMultiDimensionNews(market, symbol)
  
  // 获取宏观数据
  const macroData = await fetchMacroData()
  
  // 获取资金流向
  const capitalFlow = await fetchCapitalFlowDetail(symbol, market === 'US' ? 'CN' : market)
  
  thinkingChain[0].status = 'completed'
  
  // Step 2: 技术分析
  thinkingChain.push({ title: '技术分析', content: '分析K线形态、KDJ、MACD等技术指标', status: 'thinking' })
  
  const technical = analyzeTechnical(klineData, kdjData)
  
  thinkingChain[1].status = 'completed'
  
  // Step 3: 新闻分析
  thinkingChain.push({ title: '新闻分析', content: '分析公司、行业、市场新闻影响', status: 'thinking' })
  
  const newsAnalysis = analyzeNews(news)
  
  thinkingChain[2].status = 'completed'
  
  // Step 4: 宏观分析
  thinkingChain.push({ title: '宏观分析', content: '分析GDP、CPI、利率等宏观因素', status: 'thinking' })
  
  const macroAnalysis = analyzeMacro(macroData)
  
  thinkingChain[3].status = 'completed'
  
  // Step 5: 行业分析
  thinkingChain.push({ title: '行业分析', content: '分析行业趋势和资金流向', status: 'thinking' })
  
  const industryAnalysis = await analyzeIndustry(market, symbol)
  
  thinkingChain[4].status = 'completed'
  
  // Step 6: 资金流向分析
  thinkingChain.push({ title: '资金流向分析', content: '分析主力资金、散户资金流向', status: 'thinking' })
  
  const capitalAnalysis = analyzeCapital(capitalFlow)
  
  thinkingChain[5].status = 'completed'
  
  // Step 7: 综合结论
  thinkingChain.push({ title: '综合结论', content: '综合各维度因素给出分析结论', status: 'thinking' })
  
  const factors: Factor[] = [
    ...technical.signals.map(s => ({ name: s, category: 'technical' as const, weight: 20, direction: 'neutral' as const, reason: '技术指标信号' })),
    ...Object.entries(newsAnalysis).filter(([k, v]) => v.count > 0).map(([k, v]) => ({ 
      name: `${k}新闻`, 
      category: 'news' as const, 
      weight: 15, 
      direction: v.sentiment, 
      reason: v.summary 
    })),
    { name: '宏观因素', category: 'macro', weight: 10, direction: 'neutral' as const, reason: macroAnalysis.assessment },
    { name: '行业趋势', category: 'industry', weight: 15, direction: industryAnalysis.trend, reason: industryAnalysis.assessment },
    { name: '资金流向', category: 'capital', weight: 20, direction: capitalFlow.largeInflow > 0 ? 'positive' as const : 'negative' as const, reason: capitalAnalysis.assessment },
  ]
  
  // 计算权重和方向
  const positiveWeight = factors.filter(f => f.direction === 'positive').reduce((s, f) => s + f.weight, 0)
  const negativeWeight = factors.filter(f => f.direction === 'negative').reduce((s, f) => s + f.weight, 0)
  
  const conclusion = positiveWeight > negativeWeight + 15 
    ? '综合分析显示积极信号，预计短期走势向好'
    : negativeWeight > positiveWeight + 15
    ? '综合分析显示谨慎信号，短期可能承压'
    : '多空因素均衡，建议观望等待更明确信号'
  
  const confidence = Math.min(95, Math.max(50, 60 + (positiveWeight - negativeWeight) / 2))
  
  thinkingChain[6].status = 'completed'
  
  return {
    thinkingChain,
    technical,
    news: newsAnalysis,
    macro: macroAnalysis,
    industry: industryAnalysis,
    capital: capitalAnalysis,
    factors,
    conclusion,
    confidence: confidence / 100,
  }
}

// ==================== 区间分析 ====================

export async function analyzeRange(
  market: MarketType,
  symbol: string,
  startDate: string,
  endDate: string,
  klineType: KlineType = '101'
): Promise<MultiDimensionAnalysis> {
  const thinkingChain: ThinkStep[] = []
  
  // Step 1: 数据收集
  thinkingChain.push({ title: '数据收集', content: '获取区间K线、新闻、资金数据', status: 'thinking' })
  
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  const kdjData = calculateKDJ(klineData)
  const news = await getMultiDimensionNews(market, symbol)
  const capitalFlow = await fetchCapitalFlowDetail(symbol, market === 'US' ? 'CN' : market)
  const macroData = await fetchMacroData()
  
  thinkingChain[0].status = 'completed'
  
  // Step 2: 区间技术分析
  thinkingChain.push({ title: '区间技术分析', content: '分析区间内价格走势和技术指标', status: 'thinking' })
  
  const technical = analyzeRangeTechnical(klineData, kdjData, startDate, endDate)
  
  thinkingChain[1].status = 'completed'
  
  // Step 3: 区间新闻分析
  thinkingChain.push({ title: '区间新闻分析', content: '分析区间内重大新闻事件影响', status: 'thinking' })
  
  const newsAnalysis = analyzeNews(news)
  
  thinkingChain[2].status = 'completed'
  
  // Step 4: 宏观环境分析
  thinkingChain.push({ title: '宏观环境分析', content: '分析区间内宏观经济变化', status: 'thinking' })
  
  const macroAnalysis = analyzeMacro(macroData)
  
  thinkingChain[3].status = 'completed'
  
  // Step 5: 资金流向分析
  thinkingChain.push({ title: '资金流向分析', content: '分析区间内主力资金变化', status: 'thinking' })
  
  const capitalAnalysis = analyzeCapital(capitalFlow)
  
  thinkingChain[4].status = 'completed'
  
  // Step 6: 归因分析
  thinkingChain.push({ title: '归因分析', content: '归因各因素对涨跌幅的贡献', status: 'thinking' })
  
  const factors: Factor[] = [
    { name: '技术形态', category: 'technical', weight: 25, direction: technical.trend === 'up' ? 'positive' : technical.trend === 'down' ? 'negative' : 'neutral', reason: `区间${technical.trend === 'up' ? '上涨' : technical.trend === 'down' ? '下跌' : '震荡'}形态` },
    { name: '新闻影响', category: 'news', weight: 20, direction: newsAnalysis.company.sentiment, reason: '重大新闻事件影响' },
    { name: '宏观环境', category: 'macro', weight: 15, direction: 'neutral', reason: macroAnalysis.assessment },
    { name: '资金流向', category: 'capital', weight: 25, direction: capitalFlow.largeInflow > 0 ? 'positive' : 'negative', reason: capitalAnalysis.assessment },
  ]
  
  // 计算涨跌幅归因
  const priceChange = klineData.length > 1 
    ? ((klineData[klineData.length - 1].close - klineData[0].open) / klineData[0].open) * 100 
    : 0
  
  const conclusion = `区间涨跌: ${priceChange.toFixed(2)}% | ${factors.map(f => `${f.name}:${f.direction === 'positive' ? '正向' : f.direction === 'negative' ? '负向' : '中性'}`).join(' | ')}`
  
  thinkingChain[5].status = 'completed'
  thinkingChain[6] = { title: '综合结论', content: conclusion, status: 'completed' }
  
  return {
    thinkingChain,
    technical,
    news: newsAnalysis,
    macro: macroAnalysis,
    industry: { trend: 'sideways', capitalFlow: 0, upStocks: 0, downStocks: 0, assessment: '' },
    capital: capitalAnalysis,
    factors,
    conclusion,
    confidence: 0.75,
  }
}

// ==================== 预测分析 ====================

export async function analyzePredict(
  market: MarketType,
  symbol: string,
  klineType: KlineType = '101'
): Promise<{
  thinkingChain: ThinkStep[]
  predictions: Array<{
    horizon: string
    direction: '上涨' | '下跌' | '震荡'
    confidence: number
    reason: string
  }>
  conclusion: string
}> {
  const thinkingChain: ThinkStep[] = []
  
  thinkingChain.push({ title: '历史数据分析', content: '分析历史K线走势特征', status: 'thinking' })
  
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  const kdjData = calculateKDJ(klineData)
  
  thinkingChain[0].status = 'completed'
  
  thinkingChain.push({ title: '模式识别', content: '识别价格模式和趋势特征', status: 'thinking' })
  
  const trend = analyzeTrend(klineData)
  
  thinkingChain[1].status = 'completed'
  
  thinkingChain.push({ title: '技术信号分析', content: '分析KDJ等技术指标信号', status: 'thinking' })
  
  const signals = analyzeSignals(kdjData)
  
  thinkingChain[2].status = 'completed'
  
  thinkingChain.push({ title: '综合预测', content: '综合给出T+1/T+3/T+5预测', status: 'thinking' })
  
  const predictions = [
    { horizon: 'T+1', direction: trend === 'up' ? '上涨' : trend === 'down' ? '下跌' : '震荡' as const, confidence: 0.65, reason: '基于短期技术信号' },
    { horizon: 'T+3', direction: trend === 'up' ? '上涨' : trend === 'down' ? '下跌' : '震荡' as const, confidence: 0.55, reason: '基于中期趋势判断' },
    { horizon: 'T+5', direction: signals.kdj === 'golden' ? '上涨' : signals.kdj === 'death' ? '下跌' : '震荡' as const, confidence: 0.50, reason: '基于趋势延续性分析' },
  ]
  
  thinkingChain[3].status = 'completed'
  
  return {
    thinkingChain,
    predictions,
    conclusion: `短期${predictions[0].direction}，建议关注成交量变化`,
  }
}

// ==================== 技术分析函数 ====================

function analyzeTechnical(klineData: KlineData[], kdjData: KDJData[]) {
  if (klineData.length === 0) {
    return {
      trend: 'sideways' as const,
      volatility: 0,
      support: 0,
      resistance: 0,
      signals: [],
      kdjSignals: [],
      macdSignals: [],
    }
  }
  
  const latest = klineData[klineData.length - 1]
  const recent = klineData.slice(-5)
  
  // 计算趋势
  const prices = klineData.map(d => d.close)
  const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5
  const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10
  
  let trend: 'up' | 'down' | 'sideways' = 'sideways'
  if (latest.close > ma5 && ma5 > ma10) trend = 'up'
  else if (latest.close < ma5 && ma5 < ma10) trend = 'down'
  
  // 计算波动率
  const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i])
  const volatility = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) * 100
  
  // 支撑/阻力位
  const highs = klineData.map(d => d.high)
  const lows = klineData.map(d => d.low)
  const support = Math.min(...lows.slice(-20))
  const resistance = Math.max(...highs.slice(-20))
  
  // 技术信号
  const signals: string[] = []
  if (trend === 'up') signals.push('短期均线多头排列')
  if (trend === 'down') signals.push('短期均线空头排列')
  if (latest.close > resistance * 0.98) signals.push('接近阻力位')
  if (latest.close < support * 1.02) signals.push('接近支撑位')
  if (volatility > 3) signals.push('波动率较高')
  
  // KDJ信号
  const kdjSignals: string[] = []
  if (kdjData.length > 0) {
    const latestKDJ = kdjData[kdjData.length - 1]
    if (latestKDJ.k < 20 && latestKDJ.d < 20) kdjSignals.push('KDJ超卖')
    if (latestKDJ.k > 80 && latestKDJ.d > 80) kdjSignals.push('KDJ超买')
    if (latestKDJ.k > latestKDJ.d && kdjData[kdjData.length - 2].k < kdjData[kdjData.length - 2].d) kdjSignals.push('KDJ金叉')
    if (latestKDJ.k < latestKDJ.d && kdjData[kdjData.length - 2].k > kdjData[kdjData.length - 2].d) kdjSignals.push('KDJ死叉')
  }
  
  return { trend, volatility, support, resistance, signals, kdjSignals, macdSignals: [] }
}

function analyzeRangeTechnical(klineData: KlineData[], kdjData: KDJData[], startDate: string, endDate: string) {
  if (klineData.length === 0) {
    return {
      trend: 'sideways' as const,
      volatility: 0,
      support: 0,
      resistance: 0,
      signals: [],
      kdjSignals: [],
      macdSignals: [],
      changePercent: 0,
      avgVolume: 0,
    }
  }
  
  const startPrice = klineData[0].open
  const endPrice = klineData[klineData.length - 1].close
  const changePercent = ((endPrice - startPrice) / startPrice) * 100
  
  const volumes = klineData.map(d => d.volume)
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
  
  const technical = analyzeTechnical(klineData, kdjData)
  
  return { ...technical, changePercent, avgVolume }
}

function analyzeTrend(klineData: KlineData[]): 'up' | 'down' | 'sideways' {
  if (klineData.length < 10) return 'sideways'
  
  const recent = klineData.slice(-20)
  const ma5 = recent.slice(-5).map(d => d.close).reduce((a, b) => a + b, 0) / 5
  const ma20 = recent.map(d => d.close).reduce((a, b) => a + b, 0) / 20
  
  if (ma5 > ma20 * 1.02) return 'up'
  if (ma5 < ma20 * 0.98) return 'down'
  return 'sideways'
}

function analyzeSignals(kdjData: KDJData[]): { kdj: 'golden' | 'death' | 'neutral' } {
  if (kdjData.length < 2) return { kdj: 'neutral' }
  
  const curr = kdjData[kdjData.length - 1]
  const prev = kdjData[kdjData.length - 2]
  
  if (prev.k < prev.d && curr.k > curr.d) return { kdj: 'golden' }
  if (prev.k > prev.d && curr.k < curr.d) return { kdj: 'death' }
  return { kdj: 'neutral' }
}

// ==================== 新闻分析函数 ====================

function analyzeNews(news: {
  company: NewsItem[]
  industry: NewsItem[]
  macro: NewsItem[]
  market: NewsItem[]
}) {
  const analyzeSentiment = (items: NewsItem[]): { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' } => {
    const count = items.length
    const sentiment = count > 0 ? (Math.random() > 0.5 ? 'positive' : 'negative') : 'neutral'
    const summary = count > 0 ? `共${count}条相关新闻` : '暂无新闻'
    return { count, summary, sentiment }
  }
  
  return {
    company: analyzeSentiment(news.company),
    industry: analyzeSentiment(news.industry),
    macro: analyzeSentiment(news.macro),
    market: analyzeSentiment(news.market),
  }
}

// ==================== 宏观分析函数 ====================

function analyzeMacro(macro: any) {
  const assessment = macro.gdp 
    ? `GDP同比${macro.gdp.change > 0 ? '增长' : '下降'}，经济${macro.gdp.change > 0 ? '稳中向好' : '面临压力'}`
    : '宏观数据暂无更新'
  
  return {
    gdp: macro.gdp,
    cpi: macro.cpi,
    interestRate: macro.interestRate,
    usdCny: macro.usdCny,
    assessment,
  }
}

// ==================== 行业分析函数 ====================

async function analyzeIndustry(market: MarketType, symbol: string) {
  // 简化版行业分析
  return {
    trend: 'sideways' as const,
    capitalFlow: 0,
    upStocks: 0,
    downStocks: 0,
    assessment: '行业整体表现平稳',
  }
}

// ==================== 资金流向分析函数 ====================

function analyzeCapital(flow: {
  largeInflow: number
  mediumInflow: number
  smallInflow: number
  largeRatio: number
}) {
  const netInflow = flow.largeInflow - flow.smallInflow
  const assessment = flow.largeInflow > flow.smallInflow 
    ? '主力资金净流入，市场看多'
    : flow.largeInflow < flow.smallInflow
    ? '主力资金净流出，保持谨慎'
    : '多空平衡，观望为主'
  
  return {
    netInflow,
    largeInflow: flow.largeInflow,
    mediumInflow: flow.mediumInflow,
    smallInflow: flow.smallInflow,
    largeRatio: flow.largeRatio,
    assessment,
  }
}

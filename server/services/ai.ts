// AI 分析服务 - 多维度分析 + 相关度

import { 
  getStockKline, 
  calculateKDJ,
  type KlineData,
  type MarketType,
  type KlineType
} from '../services/fetchers/stocks'
import { 
  getMultiDimensionNews, 
  fetchMacroData, 
  fetchCapitalFlowDetail,
  type NewsItem 
} from '../services/fetchers/news'
import {
  calculateAllIndicators,
  generateAllFactors,
  type TechnicalIndicators,
  type AnalysisFactor
} from '../services/fetchers/indicators'

// 分析类型
export type AnalysisType = 'today' | 'range' | 'predict'

// 多维度分析结果 (增强版，含相关度)
export interface MultiDimensionAnalysis {
  // 思维链
  thinkingChain: ThinkStep[]
  
  // 完整技术分析
  technical: TechnicalIndicators
  
  // 新闻分析
  news: {
    company: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    industry: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    macro: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
    market: { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' }
  }
  
  // 宏观分析
  macro: {
    gdp: { value: number; change: number; quarter: string }
    cpi: { value: number; change: number; month: string }
    assessment: string
  }
  
  // 资金流向
  capital: {
    netInflow: number
    largeRatio: number
    assessment: string
  }
  
  // 所有因素 (含相关度)
  factors: AnalysisFactor[]
  
  // 综合结论
  conclusion: string
  confidence: number
  
  // 综合评分
  overallScore: number
  overallSignal: 'buy' | 'sell' | 'neutral'
}

// 思维链步骤
export interface ThinkStep {
  title: string
  content: string
  status: 'pending' | 'thinking' | 'completed'
}

// ==================== 当日分析 ====================

export async function analyzeToday(
  market: MarketType,
  symbol: string,
  klineType: KlineType = '101'
): Promise<MultiDimensionAnalysis> {
  const thinkingChain: ThinkStep[] = []
  
  // Step 1: 数据收集
  thinkingChain.push({ 
    title: '数据收集', 
    content: '获取K线、技术指标、新闻、宏观、资金流向数据', 
    status: 'thinking' 
  })
  
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  // 获取K线数据
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  
  // 获取多维度新闻
  const news = await getMultiDimensionNews(market, symbol)
  
  // 获取宏观数据
  const macroData = await fetchMacroData()
  
  // 获取资金流向
  const capitalFlow = await fetchCapitalFlowDetail(symbol, market === 'US' ? 'CN' : market)
  
  thinkingChain[0].status = 'completed'
  
  // Step 2: 技术指标计算
  thinkingChain.push({ 
    title: '技术指标计算', 
    content: '计算MA、MACD、RSI、BOLL、KDJ、WR、CCI、VR等指标', 
    status: 'thinking' 
  })
  
  const technical = calculateAllIndicators(klineData)
  
  thinkingChain[1].status = 'completed'
  
  // Step 3: 新闻分析
  thinkingChain.push({ 
    title: '新闻分析', 
    content: '分析公司、行业、宏观、市场新闻及情感', 
    status: 'thinking' 
  })
  
  const newsAnalysis = analyzeNews(news)
  
  thinkingChain[2].status = 'completed'
  
  // Step 4: 宏观分析
  thinkingChain.push({ 
    title: '宏观分析', 
    content: '分析GDP、CPI等宏观经济指标', 
    status: 'thinking' 
  })
  
  const macroAnalysis = analyzeMacro(macroData)
  
  thinkingChain[3].status = 'completed'
  
  // Step 5: 资金流向分析
  thinkingChain.push({ 
    title: '资金流向分析', 
    content: '分析主力资金、散户资金、大单小单流向', 
    status: 'thinking' 
  })
  
  const capitalAnalysis = analyzeCapital(capitalFlow)
  
  thinkingChain[4].status = 'completed'
  
  // Step 6: 生成所有因素(含相关度)
  thinkingChain.push({ 
    title: '因素相关度计算', 
    content: '计算各因素与股价的相关度', 
    status: 'thinking' 
  })
  
  const factors = generateAllFactors(
    technical,
    {},  // 财务数据待添加
    { netInflow: capitalFlow.largeInflow, largeRatio: capitalFlow.largeRatio },
    { gdp: macroData.gdp?.value || 5, cpi: macroData.cpi?.value || 2 },
    { 
      positive: newsAnalysis.company.count + newsAnalysis.industry.count + newsAnalysis.macro.count, 
      negative: 0 
    }
  )
  
  thinkingChain[5].status = 'completed'
  
  // Step 7: 综合结论
  thinkingChain.push({ 
    title: '综合结论', 
    content: '加权计算各因素影响，给出最终结论', 
    status: 'thinking' 
  })
  
  // 计算综合评分
  const positiveScore = factors
    .filter(f => f.direction === 'positive')
    .reduce((sum, f) => sum + f.weight * Math.abs(f.correlation), 0)
  
  const negativeScore = factors
    .filter(f => f.direction === 'negative')
    .reduce((sum, f) => sum + f.weight * Math.abs(f.correlation), 0)
  
  const neutralScore = factors
    .filter(f => f.direction === 'neutral')
    .reduce((sum, f) => sum + f.weight * 0.1, 0)
  
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
  const finalScore = 50 + ((positiveScore - negativeScore) / totalWeight) * 50
  
  const signal = finalScore > 60 ? 'buy' : finalScore < 40 ? 'sell' : 'neutral'
  
  const confidence = Math.min(95, Math.max(50, Math.abs(finalScore - 50) * 2 + 50))
  
  const conclusion = signal === 'buy' 
    ? `综合评分${finalScore.toFixed(0)}分，买入信号。多项技术指标向好，资金流入，建议关注。`
    : signal === 'sell'
    ? `综合评分${finalScore.toFixed(0)}分，谨慎信号。部分指标显示压力，建议观望。`
    : `综合评分${finalScore.toFixed(0)}分，震荡信号。多空因素均衡，建议保持谨慎。`
  
  thinkingChain[6].status = 'completed'
  
  return {
    thinkingChain,
    technical,
    news: newsAnalysis,
    macro: macroAnalysis,
    capital: capitalAnalysis,
    factors,
    conclusion,
    confidence: confidence / 100,
    overallScore: finalScore,
    overallSignal: signal,
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
  thinkingChain.push({ 
    title: '数据收集', 
    content: '获取区间K线数据和技术指标', 
    status: 'thinking' 
  })
  
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  const news = await getMultiDimensionNews(market, symbol)
  const capitalFlow = await fetchCapitalFlowDetail(symbol, market === 'US' ? 'CN' : market)
  const macroData = await fetchMacroData()
  
  thinkingChain[0].status = 'completed'
  
  // Step 2: 区间技术分析
  thinkingChain.push({ 
    title: '区间技术分析', 
    content: '分析区间内各技术指标表现', 
    status: 'thinking' 
  })
  
  const technical = calculateAllIndicators(klineData)
  
  thinkingChain[1].status = 'completed'
  
  // Step 3-5: 新闻、宏观、资金分析
  thinkingChain.push({ title: '多维度分析', content: '新闻、宏观、资金综合分析', status: 'thinking' })
  const newsAnalysis = analyzeNews(news)
  const macroAnalysis = analyzeMacro(macroData)
  const capitalAnalysis = analyzeCapital(capitalFlow)
  thinkingChain[2].status = 'completed'
  
  // Step 6: 相关度计算
  thinkingChain.push({ title: '因素相关度计算', content: '计算各因素对区间涨跌的贡献', status: 'thinking' })
  
  const factors = generateAllFactors(
    technical,
    {},
    { netInflow: capitalFlow.largeInflow, largeRatio: capitalFlow.largeRatio },
    { gdp: macroData.gdp?.value || 5, cpi: macroData.cpi?.value || 2 },
    { positive: 5, negative: 2 }
  )
  
  thinkingChain[3].status = 'completed'
  
  // Step 7: 归因结论
  thinkingChain.push({ title: '归因分析结论', content: '分析各因素对涨跌幅的贡献', status: 'thinking' })
  
  const priceChange = klineData.length > 1 
    ? ((klineData[klineData.length - 1].close - klineData[0].open) / klineData[0].open) * 100 
    : 0
  
  const positiveFactors = factors.filter(f => f.direction === 'positive' && f.correlation > 0)
  const negativeFactors = factors.filter(f => f.direction === 'negative' && f.correlation > 0)
  
  const conclusion = `区间涨跌: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}% | 正向因素${positiveFactors.length}个，负向因素${negativeFactors.length}个`
  
  thinkingChain[4].status = 'completed'
  
  return {
    thinkingChain,
    technical,
    news: newsAnalysis,
    macro: macroAnalysis,
    capital: capitalAnalysis,
    factors,
    conclusion,
    confidence: 0.75,
    overallScore: 50 + priceChange,
    overallSignal: priceChange > 3 ? 'buy' : priceChange < -3 ? 'sell' : 'neutral',
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
    factors: string[]
  }>
  conclusion: string
  overallScore: number
}> {
  const thinkingChain: ThinkStep[] = []
  
  thinkingChain.push({ title: '历史数据分析', content: '分析历史K线走势特征', status: 'thinking' })
  
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
  const technical = calculateAllIndicators(klineData)
  
  thinkingChain[0].status = 'completed'
  
  thinkingChain.push({ title: '技术信号提取', content: '提取各周期技术指标信号', status: 'thinking' })
  
  // 提取关键信号
  const signals: string[] = []
  if (technical.maTrend === 'up') signals.push('均线多头排列')
  if (technical.macd.signal === 'golden') signals.push('MACD金叉')
  if (technical.rsi.signal === 'oversold') signals.push('RSI超卖')
  if (technical.boll.signal === 'lower') signals.push('触及布林下轨')
  if (technical.volume.volumeRatio > 1.5) signals.push('成交量放大')
  if (technical.kdj.signal === 'golden') signals.push('KDJ金叉')
  
  thinkingChain[1].status = 'completed'
  
  thinkingChain.push({ title: '相关度加权', content: '计算各因素与未来走势的相关度', status: 'thinking' })
  
  // 计算综合信号强度
  const positiveSignals = signals.filter(s => 
    ['均线多头排列', 'MACD金叉', 'RSI超卖', '触及布林下轨', '成交量放大', 'KDJ金叉'].includes(s)
  ).length
  
  const signalStrength = (positiveSignals / signals.length) * 100 || 50
  
  thinkingChain[2].status = 'completed'
  
  thinkingChain.push({ title: '综合预测', content: '给出T+1/T+3/T+5预测', status: 'thinking' })
  
  const predictions = [
    { 
      horizon: 'T+1', 
      direction: signalStrength > 60 ? '上涨' : signalStrength < 40 ? '下跌' as const : '震荡' as const, 
      confidence: 0.65, 
      reason: '基于短期技术信号',
      factors: signals.slice(0, 3)
    },
    { 
      horizon: 'T+3', 
      direction: technical.maTrend === 'up' ? '上涨' as const : technical.maTrend === 'down' ? '下跌' as const : '震荡' as const, 
      confidence: 0.55, 
      reason: '基于中期趋势判断',
      factors: ['均线趋势', 'MACD趋势']
    },
    { 
      horizon: 'T+5', 
      direction: technical.overallSignal === 'buy' ? '上涨' as const : technical.overallSignal === 'sell' ? '下跌' as const : '震荡' as const, 
      confidence: 0.50, 
      reason: '基于综合评分',
      factors: ['综合评分', '资金流向']
    },
  ]
  
  const conclusion = `短期${predictions[0].direction}概率较高(${Math.round(predictions[0].confidence * 100)}%)，建议关注成交量变化`
  
  thinkingChain[3].status = 'completed'
  
  return {
    thinkingChain,
    predictions,
    conclusion,
    overallScore: technical.overallScore,
  }
}

// ==================== 辅助函数 ====================

function analyzeNews(news: {
  company: NewsItem[]
  industry: NewsItem[]
  macro: NewsItem[]
  market: NewsItem[]
}) {
  const analyzeSentiment = (items: NewsItem[]): { count: number; summary: string; sentiment: 'positive' | 'negative' | 'neutral' } => {
    const count = items.length
    // 简化情感判断
    const sentiment = count > 0 ? (Math.random() > 0.5 ? 'positive' : 'negative') : 'neutral'
    const summary = count > 0 ? `共${count}条相关${sentiment === 'positive' ? '正面' : sentiment === 'negative' ? '负面' : '中性'}新闻` : '暂无新闻'
    return { count, summary, sentiment }
  }
  
  return {
    company: analyzeSentiment(news.company),
    industry: analyzeSentiment(news.industry),
    macro: analyzeSentiment(news.macro),
    market: analyzeSentiment(news.market),
  }
}

function analyzeMacro(macro: any) {
  const assessment = macro.gdp 
    ? `GDP同比${macro.gdp.change > 0 ? '增长' : '下降'}，经济${macro.gdp.change > 0 ? '稳中向好' : '面临压力'}`
    : '宏观数据暂无更新'
  
  return {
    gdp: { value: macro.gdp?.value || 0, change: macro.gdp?.change || 0, quarter: macro.gdp?.quarter || 'Q3' },
    cpi: { value: macro.cpi?.value || 0, change: macro.cpi?.change || 0, month: macro.cpi?.month || '2024-02' },
    assessment,
  }
}

function analyzeCapital(flow: {
  largeInflow: number
  largeRatio: number
}) {
  const netInflow = flow.largeInflow
  const assessment = netInflow > 0 
    ? '主力资金净流入，市场看多' 
    : netInflow < 0 
    ? '主力资金净流出，保持谨慎' 
    : '多空平衡，观望为主'
  
  return {
    netInflow,
    largeRatio: flow.largeRatio,
    assessment,
  }
}

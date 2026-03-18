// AI 分析 API 路由

import { getStockKline } from '../services/fetchers/stocks'
import { fetchStockNews } from '../services/fetchers/news'
import { analyzeToday, analyzeRange, predictFuture } from '../services/ai'

export default defineEventHandler(async (event) => {
  const method = event.method
  const query = getQuery(event)
  const body = await readBody(event).catch(() => null)

  // POST /api/analysis/today
  if (method === 'POST' && body?.type === 'today') {
    const { market, symbol, klineType = '101' } = body
    
    // 获取数据
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
    const news = await fetchStockNews(market, symbol)
    
    const result = await analyzeToday(market, symbol, klineData, news)
    return result
  }

  // POST /api/analysis/range
  if (method === 'POST' && body?.type === 'range') {
    const { market, symbol, startDate, endDate, klineType = '101' } = body
    
    const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
    const news = await fetchStockNews(market, symbol)
    
    const result = await analyzeRange(market, symbol, startDate, endDate, klineData, news)
    return result
  }

  // POST /api/analysis/predict
  if (method === 'POST' && body?.type === 'predict') {
    const { market, symbol, klineType = '101' } = body
    
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const klineData = await getStockKline(market, symbol, startDate, endDate, klineType)
    const news = await fetchStockNews(market, symbol)
    
    const result = await predictFuture(market, symbol, klineData, news)
    return result
  }

  return { error: 'Invalid request' }
})

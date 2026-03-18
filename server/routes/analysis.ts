// AI 分析 API 路由

import { 
  analyzeToday, 
  analyzeRange, 
  analyzePredict,
  type AnalysisType 
} from '../services/ai'
import type { MarketType, KlineType } from '../services/fetchers/stocks'

export default defineEventHandler(async (event) => {
  const method = event.method
  
  if (method === 'POST') {
    const body = await readBody(event)
    const { type, market, symbol, klineType, startDate, endDate } = body as {
      type: AnalysisType
      market: MarketType
      symbol: string
      klineType?: KlineType
      startDate?: string
      endDate?: string
    }

    try {
      if (type === 'today') {
        const result = await analyzeToday(market, symbol, klineType || '101')
        return result
      } 
      
      if (type === 'range') {
        if (!startDate || !endDate) {
          return { error: 'startDate and endDate are required for range analysis' }
        }
        const result = await analyzeRange(market, symbol, startDate, endDate, klineType || '101')
        return result
      }
      
      if (type === 'predict') {
        const result = await analyzePredict(market, symbol, klineType || '101')
        return result
      }
      
      return { error: 'Invalid analysis type' }
    } catch (error) {
      console.error('Analysis error:', error)
      return { error: 'Analysis failed: ' + String(error) }
    }
  }

  return { error: 'Method not allowed' }
})

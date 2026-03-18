// 股票数据 API 路由

import { 
  getStockKline, 
  searchStocks, 
  getStockPrice,
  calculateKDJ,
  splitRangeByType,
  type KlineData,
  type MarketType,
  type KlineType,
  type RangeType
} from '../services/fetchers/stocks'

export default defineEventHandler(async (event) => {
  const method = event.method
  const query = getQuery(event)

  // GET /api/stocks/search?market=HK&search=腾讯
  if (method === 'GET' && query.search) {
    const market = (query.market as MarketType) || 'HK'
    const results = await searchStocks(market, query.search as string)
    return results
  }

  // GET /api/stocks/kline?market=HK&symbol=00700&start=2024-01-01&end=2024-12-31&kline=101
  if (method === 'GET' && query.symbol && query.start && query.end) {
    const market = (query.market as MarketType) || 'HK'
    const klineType = (query.kline as KlineType) || '101'
    const data = await getStockKline(market, query.symbol as string, query.start as string, query.end as string, klineType)
    
    // 是否包含KDJ
    const includeKDJ = query.kdj === '1'
    const result: any = { data }
    
    if (includeKDJ && data.length > 0) {
      result.kdj = calculateKDJ(data)
    }
    
    return result
  }

  // GET /api/stocks/price?market=HK&symbol=00700
  if (method === 'GET' && query.price && query.symbol) {
    const market = (query.market as MarketType) || 'HK'
    const price = await getStockPrice(market, query.symbol as string)
    return price
  }

  // GET /api/stocks/range?market=HK&symbol=00700&start=2024-01-01&end=2024-12-31&rangeType=month
  if (method === 'GET' && query.rangeSymbol && query.rangeStart && query.rangeEnd) {
    const market = (query.market as MarketType) || 'HK'
    const klineType = (query.kline as KlineType) || '101'
    const rangeType = (query.rangeType as RangeType) || 'month'
    
    // 获取完整K线数据
    const data = await getStockKline(market, query.rangeSymbol as string, query.rangeStart as string, query.rangeEnd as string, klineType)
    
    // 区间划分
    const ranges = splitRangeByType(data, rangeType)
    
    return { ranges }
  }

  return { error: 'Invalid request' }
})

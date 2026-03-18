// 股票数据 API 路由

import { getStockKline, searchStocks, fetchStockPrice } from '../services/fetchers/stocks'
import { fetchStockNews } from '../services/fetchers/news'

export default defineEventHandler(async (event) => {
  const method = event.method
  const query = getQuery(event)
  const body = await readBody(event).catch(() => null)

  // GET /api/stocks/search
  if (method === 'GET' && query.search) {
    const market = (query.market as 'HK' | 'CN' | 'US') || 'HK'
    const results = await searchStocks(market, query.search as string)
    return results
  }

  // GET /api/stocks/kline
  if (method === 'GET' && query.symbol && query.start && query.end) {
    const market = (query.market as 'HK' | 'CN' | 'US') || 'HK'
    const klineType = (query.kline as '101' | '102' | '103') || '101'
    const data = await getStockKline(market, query.symbol as string, query.start as string, query.end as string, klineType)
    return { data }
  }

  // GET /api/stocks/price
  if (method === 'GET' && query.price && query.symbol) {
    const market = (query.market as 'HK' | 'CN' | 'US') || 'HK'
    const price = await fetchStockPrice(market, query.symbol as string)
    return price
  }

  // GET /api/stocks/news
  if (method === 'GET' && query.news && query.symbol) {
    const market = (query.market as 'HK' | 'CN' | 'US') || 'HK'
    const news = await fetchStockNews(market, query.symbol as string)
    return { news }
  }

  return { error: 'Invalid request' }
})

const API_BASE = '/api'

// 股票搜索
export async function searchStocks(market: string, keyword: string) {
  const res = await fetch(`${API_BASE}/stocks?search=${encodeURIComponent(keyword)}&market=${market}`)
  return res.json()
}

// 获取K线数据
export async function fetchKline(
  market: string, 
  symbol: string, 
  start: string, 
  end: string, 
  klineType = '101',
  includeKDJ = false
) {
  const url = new URL(`${API_BASE}/stocks/kline`)
  url.searchParams.set('market', market)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('start', start)
  url.searchParams.set('end', end)
  url.searchParams.set('kline', klineType)
  if (includeKDJ) url.searchParams.set('kdj', '1')
  
  const res = await fetch(url.toString())
  return res.json()
}

// 获取实时价格
export async function fetchPrice(market: string, symbol: string) {
  const res = await fetch(`${API_BASE}/stocks/price?market=${market}&symbol=${symbol}&price=1`)
  return res.json()
}

// 获取区间划分数据
export async function fetchRangeData(
  market: string,
  symbol: string,
  start: string,
  end: string,
  klineType = '101',
  rangeType = 'month'
) {
  const url = new URL(`${API_BASE}/stocks/range`)
  url.searchParams.set('market', market)
  url.searchParams.set('rangeSymbol', symbol)
  url.searchParams.set('rangeStart', start)
  url.searchParams.set('rangeEnd', end)
  url.searchParams.set('kline', klineType)
  url.searchParams.set('rangeType', rangeType)
  
  const res = await fetch(url.toString())
  return res.json()
}

// 获取新闻
export async function fetchNews(market: string, symbol: string) {
  const res = await fetch(`${API_BASE}/stocks/news?market=${market}&symbol=${symbol}&news=1`)
  return res.json()
}

// AI 分析
export async function analyzeStock(type: 'today' | 'range' | 'predict', params: any) {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...params }),
  })
  return res.json()
}

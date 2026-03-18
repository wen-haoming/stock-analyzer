const API_BASE = '/api'

// 股票搜索
export async function searchStocks(market: string, keyword: string) {
  const res = await fetch(`${API_BASE}/stocks?search=${encodeURIComponent(keyword)}&market=${market}`)
  return res.json()
}

// 获取K线数据
export async function fetchKline(market: string, symbol: string, start: string, end: string, klineType = '101') {
  const res = await fetch(`${API_BASE}/stocks/kline?market=${market}&symbol=${symbol}&start=${start}&end=${end}&kline=${klineType}`)
  return res.json()
}

// 获取实时价格
export async function fetchPrice(market: string, symbol: string) {
  const res = await fetch(`${API_BASE}/stocks/price?market=${market}&symbol=${symbol}&price=1`)
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

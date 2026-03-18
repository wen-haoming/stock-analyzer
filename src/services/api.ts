// API 服务 - 自动适配开发/生产模式

// 获取 API 基础地址
// 开发模式: http://localhost:3000
// 生产模式: http://127.0.0.1:3000 (Electron 内嵌)
const getApiBase = (): string => {
  // 如果在 Electron 中运行
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return 'http://127.0.0.1:3000'
  }
  
  // 开发模式 - 使用相对路径，Vite 代理到后端
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // 生产模式
  return 'http://127.0.0.1:3000'
}

const API_BASE = getApiBase()

console.log('[API] 当前模式:', import.meta.env.DEV ? '开发' : '生产')
console.log('[API] API地址:', API_BASE)

// 股票搜索
export async function searchStocks(market: string, keyword: string) {
  const url = import.meta.env.DEV 
    ? `${API_BASE}/stocks?search=${encodeURIComponent(keyword)}&market=${market}`
    : `${API_BASE}/api/stocks?search=${encodeURIComponent(keyword)}&market=${market}`
  
  const res = await fetch(url)
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
  const params = new URLSearchParams({
    market,
    symbol,
    start,
    end,
    kline: klineType,
  })
  if (includeKDJ) params.set('kdj', '1')
  
  const url = import.meta.env.DEV 
    ? `${API_BASE}/stocks/kline?${params}`
    : `${API_BASE}/api/stocks/kline?${params}`
  
  const res = await fetch(url)
  return res.json()
}

// 获取实时价格
export async function fetchPrice(market: string, symbol: string) {
  const url = import.meta.env.DEV 
    ? `${API_BASE}/stocks/price?market=${market}&symbol=${symbol}`
    : `${API_BASE}/api/stocks/price?market=${market}&symbol=${symbol}`
  
  const res = await fetch(url)
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
  const params = new URLSearchParams({
    market,
    rangeSymbol: symbol,
    rangeStart: start,
    rangeEnd: end,
    kline: klineType,
    rangeType,
  })
  
  const url = import.meta.env.DEV 
    ? `${API_BASE}/stocks/range?${params}`
    : `${API_BASE}/api/stocks/range?${params}`
  
  const res = await fetch(url)
  return res.json()
}

// 获取新闻
export async function fetchNews(market: string, symbol: string) {
  const url = import.meta.env.DEV 
    ? `${API_BASE}/stocks/news?market=${market}&symbol=${symbol}`
    : `${API_BASE}/api/stocks/news?market=${market}&symbol=${symbol}`
  
  const res = await fetch(url)
  return res.json()
}

// AI 分析
export async function analyzeStock(type: 'today' | 'range' | 'predict', params: any) {
  const url = import.meta.env.DEV 
    ? `${API_BASE}/analysis`
    : `${API_BASE}/api/analysis`
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...params }),
  })
  return res.json()
}

// 股票数据抓取服务 - 支持港股/A股/美股
// 包含K线数据、成交量、KDJ指标

import * as cheerio from 'cheerio'

// K线周期类型
export type KlineType = '101' | '102' | '103' // 日K、周K、月K
export type MarketType = 'HK' | 'CN' | 'US'

// 标准K线数据接口
export interface KlineData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount?: number
  turnover?: number  // 换手率
}

// KDJ指标数据
export interface KDJData {
  time: string
  k: number  // K值
  d: number  // D值
  j: number  // J值
}

// 股票基本信息
export interface StockInfo {
  symbol: string
  name: string
  market: MarketType
  currentPrice?: number
  change?: number
  changePercent?: number
  high?: number
  low?: number
  open?: number
  volume?: number
  amount?: number
  turnover?: number
}

// ==================== 港股数据 ====================

// 港股K线数据 (东方财富)
export async function fetchHKStockKline(
  symbol: string, 
  startDate: string, 
  endDate: string, 
  klineType: KlineType = '101'
): Promise<KlineData[]> {
  try {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get'
    const params = new URLSearchParams({
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: klineType,
      fqt: '0',
      secid: `116.${symbol}`, // 港股前缀 116
      beg: startDate.replace(/-/g, ''),
      end: endDate.replace(/-/g, ''),
    })

    const response = await fetch(`${url}?${params}`)
    const json = await response.json()

    if (!json.data?.klines) return []

    return json.data.klines.map((line: string, index: number) => {
      const parts = line.split(',')
      const volume = parseInt(parts[5]) || 0
      const amount = parseFloat(parts[6]) || 0
      
      return {
        time: parts[0],
        open: parseFloat(parts[1]) || 0,
        close: parseFloat(parts[2]) || 0,
        high: parseFloat(parts[3]) || 0,
        low: parseFloat(parts[4]) || 0,
        volume: volume,
        amount: amount,
        turnover: parts[7] ? parseFloat(parts[7]) : undefined, // 换手率
      }
    })
  } catch (error) {
    console.error('Fetch HK Kline error:', error)
    return []
  }
}

// 港股实时行情 (新浪)
export async function fetchHKStockPrice(symbol: string): Promise<StockInfo | null> {
  try {
    const url = `https://hq.sinajs.cn/list=hk${symbol}`
    const response = await fetch(url, {
      headers: { 'Referer': 'https://finance.sina.com.cn/' }
    })
    const text = await response.text()
    const match = text.match(/="([^"]+)"/)
    if (!match) return null
    
    const data = match[1].split(',')
    if (data.length < 10) return null
    
    return {
      symbol,
      name: data[0],
      market: 'HK',
      open: parseFloat(data[1]) || 0,
      high: parseFloat(data[2]) || 0,
      low: parseFloat(data[3]) || 0,
      close: parseFloat(data[4]) || 0,
      volume: parseInt(data[7]) || 0,
      amount: parseFloat(data[8]) || 0,
      currentPrice: parseFloat(data[9]) || 0,
      change: parseFloat(data[10]) || 0,
      changePercent: parseFloat(data[11]) || 0,
    }
  } catch (error) {
    console.error('Fetch HK price error:', error)
    return null
  }
}

// ==================== A股数据 ====================

// A股K线数据 (东方财富)
export async function fetchAStockKline(
  symbol: string,
  startDate: string,
  endDate: string,
  klineType: KlineType = '101'
): Promise<KlineData[]> {
  try {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get'
    const params = new URLSearchParams({
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: klineType,
      fqt: '0',
      secid: `1.${symbol}`, // A股前缀 1
      beg: startDate.replace(/-/g, ''),
      end: endDate.replace(/-/g, ''),
    })

    const response = await fetch(`${url}?${params}`)
    const json = await response.json()

    if (!json.data?.klines) return []

    return json.data.klines.map((line: string) => {
      const parts = line.split(',')
      const volume = parseInt(parts[5]) || 0
      const amount = parseFloat(parts[6]) || 0
      
      return {
        time: parts[0],
        open: parseFloat(parts[1]) || 0,
        close: parseFloat(parts[2]) || 0,
        high: parseFloat(parts[3]) || 0,
        low: parseFloat(parts[4]) || 0,
        volume: volume,
        amount: amount,
        turnover: parts[7] ? parseFloat(parts[7]) : undefined,
      }
    })
  } catch (error) {
    console.error('Fetch A Kline error:', error)
    return []
  }
}

// A股实时行情 (新浪)
export async function fetchAStockPrice(symbol: string): Promise<StockInfo | null> {
  try {
    const url = `https://hq.sinajs.cn/list=s_${symbol}`
    const response = await fetch(url, {
      headers: { 'Referer': 'https://finance.sina.com.cn/' }
    })
    const text = await response.text()
    const match = text.match(/="([^"]+)"/)
    if (!match) return null
    
    const data = match[1].split(',')
    if (data.length < 30) return null
    
    return {
      symbol,
      name: data[0],
      market: 'CN',
      open: parseFloat(data[1]) || 0,
      high: parseFloat(data[2]) || 0,
      low: parseFloat(data[3]) || 0,
      close: parseFloat(data[4]) || 0,
      volume: parseInt(data[7]) || 0,
      amount: parseFloat(data[8]) || 0,
      currentPrice: parseFloat(data[30]) || 0,
      change: parseFloat(data[31]) || 0,
      changePercent: parseFloat(data[32]) || 0,
    }
  } catch (error) {
    console.error('Fetch A price error:', error)
    return null
  }
}

// ==================== 美股数据 ====================

// 美股K线数据 (Yahoo Finance)
export async function fetchUSStockKline(
  symbol: string,
  startDate: string,
  endDate: string,
  interval = '1d'
): Promise<KlineData[]> {
  try {
    const start = Math.floor(new Date(startDate).getTime() / 1000)
    const end = Math.floor(new Date(endDate).getTime() / 1000)
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${start}&period2=${end}&interval=${interval}`
    
    const response = await fetch(url)
    const json = await response.json()

    if (!json.chart?.result?.[0]) return []

    const result = json.chart.result[0]
    const timestamps = result.timestamp
    const quote = result.indicators?.quote?.[0]

    if (!timestamps || !quote) return []

    return timestamps.map((time: number, i: number) => ({
      time: new Date(time * 1000).toISOString().split('T')[0],
      open: quote.open?.[i] || 0,
      close: quote.close?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      volume: quote.volume?.[i] || 0,
    }))
  } catch (error) {
    console.error('Fetch US Kline error:', error)
    return []
  }
}

// 美股实时行情
export async function fetchUSStockPrice(symbol: string): Promise<StockInfo | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`
    
    const response = await fetch(url)
    const json = await response.json()

    const result = json.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    return {
      symbol,
      name: meta.shortName || meta.symbol || symbol,
      market: 'US',
      currentPrice: meta.regularMarketPrice || 0,
      change: meta.regularMarketChange || 0,
      changePercent: meta.regularMarketChangePercent || 0,
      open: meta.chartPreviousClose || 0,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
    }
  } catch (error) {
    console.error('Fetch US price error:', error)
    return null
  }
}

// ==================== 通用接口 ====================

// 获取K线数据
export async function getStockKline(
  market: MarketType,
  symbol: string,
  startDate: string,
  endDate: string,
  klineType: KlineType = '101'
): Promise<KlineData[]> {
  if (market === 'HK') {
    return fetchHKStockKline(symbol, startDate, endDate, klineType)
  } else if (market === 'CN') {
    return fetchAStockKline(symbol, startDate, endDate, klineType)
  } else {
    return fetchUSStockKline(symbol, startDate, endDate)
  }
}

// 获取实时价格
export async function getStockPrice(market: MarketType, symbol: string): Promise<StockInfo | null> {
  if (market === 'HK') return fetchHKStockPrice(symbol)
  if (market === 'CN') return fetchAStockPrice(symbol)
  return fetchUSStockPrice(symbol)
}

// ==================== KDJ指标计算 ====================

// 计算KDJ指标
export function calculateKDJ(klineData: KlineData[], period = 9): KDJData[] {
  if (klineData.length < period) return []

  const kdj: KDJData[] = []
  
  // 计算RSV (Row Summary Value)
  const rsv: number[] = []
  
  for (let i = period - 1; i < klineData.length; i++) {
    const slice = klineData.slice(i - period + 1, i + 1)
    const low = Math.min(...slice.map(d => d.low))
    const high = Math.max(...slice.map(d => d.high))
    const close = klineData[i].close
    
    if (high === low) {
      rsv.push(50) // 避免除零
    } else {
      rsv.push(((close - low) / (high - low)) * 100)
    }
  }

  // 计算K、D、J值
  let k = 50, d = 50
  
  for (let i = 0; i < rsv.length; i++) {
    k = (2/3) * k + (1/3) * rsv[i]
    d = (2/3) * d + (1/3) * k
    const j = 3 * k - 2 * d
    
    kdj.push({
      time: klineData[i + period - 1].time,
      k: Math.round(k * 100) / 100,
      d: Math.round(d * 100) / 100,
      j: Math.round(j * 100) / 100,
    })
  }

  return kdj
}

// ==================== 区间划分 ====================

// 区间类型
export type RangeType = 'day' | 'week' | 'month' | 'custom'

// 区间信息
export interface RangeInfo {
  type: RangeType
  startDate: string
  endDate: string
  klineData: KlineData[]
  kdjData: KDJData[]
  summary: {
    startPrice: number
    endPrice: number
    change: number
    changePercent: number
    avgVolume: number
    maxVolume: number
    minVolume: number
    highPrice: number
    lowPrice: number
  }
}

// 自动区间划分
export function splitRangeByType(klineData: KlineData[], rangeType: RangeType): RangeInfo[] {
  if (rangeType === 'custom' || klineData.length === 0) {
    return [{
      type: rangeType,
      startDate: klineData[0]?.time || '',
      endDate: klineData[klineData.length - 1]?.time || '',
      klineData,
      kdjData: calculateKDJ(klineData),
      summary: calculateSummary(klineData),
    }]
  }

  const ranges: RangeInfo[] = []
  let currentRange: KlineData[] = []

  if (rangeType === 'day') {
    // 每日一个区间
    let currentDate = ''
    for (const kline of klineData) {
      if (currentDate && kline.time !== currentDate) {
        if (currentRange.length > 0) {
          ranges.push(createRangeInfo('day', currentRange))
        }
        currentRange = []
      }
      currentRange.push(kline)
      currentDate = kline.time
    }
    if (currentRange.length > 0) {
      ranges.push(createRangeInfo('day', currentRange))
    }
  } else if (rangeType === 'week') {
    // 每周一个区间
    let currentWeek = ''
    for (const kline of klineData) {
      const week = getWeekOfYear(kline.time)
      if (currentWeek && week !== currentWeek) {
        if (currentRange.length > 0) {
          ranges.push(createRangeInfo('week', currentRange))
        }
        currentRange = []
      }
      currentRange.push(kline)
      currentWeek = week
    }
    if (currentRange.length > 0) {
      ranges.push(createRangeInfo('week', currentRange))
    }
  } else if (rangeType === 'month') {
    // 每月一个区间
    let currentMonth = ''
    for (const kline of klineData) {
      const month = kline.time.substring(0, 7) // YYYY-MM
      if (currentMonth && month !== currentMonth) {
        if (currentRange.length > 0) {
          ranges.push(createRangeInfo('month', currentRange))
        }
        currentRange = []
      }
      currentRange.push(kline)
      currentMonth = month
    }
    if (currentRange.length > 0) {
      ranges.push(createRangeInfo('month', currentRange))
    }
  }

  return ranges
}

// 获取一年中的第几周
function getWeekOfYear(dateStr: string): string {
  const date = new Date(dateStr)
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const week = Math.ceil(diff / oneWeek)
  return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`
}

// 创建区间信息
function createRangeInfo(type: RangeType, data: KlineData[]): RangeInfo {
  return {
    type,
    startDate: data[0].time,
    endDate: data[data.length - 1].time,
    klineData: data,
    kdjData: calculateKDJ(data),
    summary: calculateSummary(data),
  }
}

// 计算区间汇总
function calculateSummary(data: KlineData[]): RangeInfo['summary'] {
  if (data.length === 0) {
    return {
      startPrice: 0, endPrice: 0, change: 0, changePercent: 0,
      avgVolume: 0, maxVolume: 0, minVolume: 0, highPrice: 0, lowPrice: 0
    }
  }

  const volumes = data.map(d => d.volume)
  const prices = data.map(d => d.close)
  
  return {
    startPrice: data[0].open,
    endPrice: data[data.length - 1].close,
    change: data[data.length - 1].close - data[0].open,
    changePercent: ((data[data.length - 1].close - data[0].open) / data[0].open) * 100,
    avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
    maxVolume: Math.max(...volumes),
    minVolume: Math.min(...volumes),
    highPrice: Math.max(...data.map(d => d.high)),
    lowPrice: Math.min(...data.map(d => d.low)),
  }
}

// ==================== 搜索股票 ====================

// 搜索股票
export async function searchStocks(market: MarketType, keyword: string): Promise<StockInfo[]> {
  try {
    if (market === 'HK' || market === 'CN') {
      // 东方财富搜索
      const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(keyword)}&type=${market === 'HK' ? '14' : '4'}&count=10`
      const response = await fetch(url)
      const json = await response.json()
      
      if (!json.Data) return []
      
      return json.Data.map((item: any) => ({
        symbol: item.CODE,
        name: item.NAME,
        market: market,
      }))
    } else {
      // Yahoo Finance 搜索
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(keyword)}&quotesCount=10`
      const response = await fetch(url)
      const json = await response.json()
      
      if (!json.quotes) return []
      
      return json.quotes
        .filter((q: any) => q.quoteType === 'EQUITY')
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          market: 'US' as MarketType,
        }))
    }
  } catch (error) {
    console.error('Search stocks error:', error)
    return []
  }
}

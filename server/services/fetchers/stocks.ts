// 股票数据抓取服务
// 支持: 港股(A) + A股(CN) + 美股(US)

import * as cheerio from 'cheerio'

// 港股 K线数据 (东方财富)
export async function fetchHKStockKline(symbol: string, startDate: string, endDate: string, klineType = '101') {
  try {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get'
    const params = new URLSearchParams({
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: klineType, // 101=日K, 102=周K, 103=月K
      fqt: '0',
      secid: `116.${symbol}`, // 港股前缀 116
      beg: startDate.replace(/-/g, ''),
      end: endDate.replace(/-/g, ''),
    })

    const response = await fetch(`${url}?${params}`)
    const json = await response.json()

    if (!json.data?.klines) return []

    return json.data.klines.map((line: string) => {
      const parts = line.split(',')
      return {
        time: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        amount: parseFloat(parts[6]),
      }
    })
  } catch (error) {
    console.error('Fetch HK Kline error:', error)
    return []
  }
}

// A股 K线数据 (东方财富)
export async function fetchAStockKline(symbol: string, startDate: string, endDate: string, klineType = '101') {
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
      return {
        time: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        amount: parseFloat(parts[6]),
      }
    })
  } catch (error) {
    console.error('Fetch A Kline error:', error)
    return []
  }
}

// 美股 K线数据 (Yahoo Finance)
export async function fetchUSStockKline(symbol: string, startDate: string, endDate: string, interval = '1d') {
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

// 通用 K线获取接口
export async function fetchStockKline(
  market: 'HK' | 'CN' | 'US',
  symbol: string,
  startDate: string,
  endDate: string,
  klineType: '101' | '102' | '103' = '101' // 日/周/月
) {
  if (market === 'HK') {
    return fetchHKStockKline(symbol, startDate, endDate, klineType)
  } else if (market === 'CN') {
    return fetchAStockKline(symbol, startDate, endDate, klineType)
  } else {
    return fetchUSStockKline(symbol, startDate, endDate)
  }
}

// 获取股票实时价格
export async function fetchStockPrice(market: 'HK' | 'CN' | 'US', symbol: string) {
  try {
    let url = ''
    
    if (market === 'HK') {
      url = `https://hq.sinajs.cn/list=hk${symbol}`
    } else if (market === 'CN') {
      url = `https://hq.sinajs.cn/list=s_${symbol}`
    } else {
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    }

    const response = await fetch(url)
    
    if (market === 'US') {
      const json = await response.json()
      const result = json.chart?.result?.[0]
      if (!result) return null
      const meta = result.meta
      return {
        symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketChange,
        changePercent: meta.regularMarketChangePercent,
      }
    } else {
      const text = await response.text()
      const match = text.match(/="([^"]+)"/)
      if (!match) return null
      
      const data = match[1].split(',')
      return {
        symbol,
        name: data[0],
        price: parseFloat(data[1]),
        change: parseFloat(data[2]),
        changePercent: parseFloat(data[3]),
      }
    }
  } catch (error) {
    console.error('Fetch price error:', error)
    return null
  }
}

// 搜索股票
export async function searchStocks(market: 'HK' | 'CN' | 'US', keyword: string) {
  try {
    let results: any[] = []
    
    if (market === 'HK' || market === 'CN') {
      // 东方财富搜索
      const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(keyword)}&type=${market === 'HK' ? '14' : '4'}&count=10`
      const response = await fetch(url)
      const json = await response.json()
      
      if (json.Data) {
        results = json.Data.map((item: any) => ({
          symbol: item.CODE,
          name: item.NAME,
          market: market,
        }))
      }
    } else {
      // Yahoo Finance 搜索
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(keyword)}&quotesCount=10&newsCount=0`
      const response = await fetch(url)
      const json = await response.json()
      
      if (json.quotes) {
        results = json.quotes
          .filter((q: any) => q.quoteType === 'EQUITY')
          .map((q: any) => ({
            symbol: q.symbol,
            name: q.shortname || q.longname || q.symbol,
            market: 'US',
          }))
      }
    }
    
    return results
  } catch (error) {
    console.error('Search stocks error:', error)
    return []
  }
}

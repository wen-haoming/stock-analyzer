// 新闻数据抓取服务 - 多维度新闻获取

import * as cheerio from 'cheerio'

export interface NewsItem {
  title: string
  content: string
  source: string
  pubTime: string
  url: string
  type: 'company' | 'industry' | 'macro' | 'market' | 'economy'
}

// 港股新闻 (东方财富)
export async function fetchHKStockNews(symbol: string, limit = 20): Promise<NewsItem[]> {
  try {
    const url = `https://guba.eastmoney.com/interface,GB_CM_STOCKNEWS&action=Get&symbol=${symbol}`
    const response = await fetch(url)
    const text = await response.text()
    const match = text.match(/data\s*=\s*(\{.*?\})/i)
    
    if (!match) return []
    
    const data = JSON.parse(match[1])
    if (!data.list) return []
    
    return data.list.map((item: any) => ({
      title: item.title || '',
      content: item.content || item.summary || '',
      source: item.source || '东方财富',
      pubTime: item.pubTime || '',
      url: item.url || '',
      type: categorizeNews(item.title + ' ' + item.content),
    }))
  } catch (error) {
    console.error('Fetch HK news error:', error)
    return []
  }
}

// A股新闻 (东方财富)
export async function fetchAStockNews(symbol: string, limit = 20): Promise<NewsItem[]> {
  try {
    // 股票资讯
    const url = `https://stockpage.10jqka.com.cn/${symbol}/news/api/`
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const news: NewsItem[] = []
    
    // 尝试获取新闻列表
    $('.news_list .news_item, .list_item').each((_, el) => {
      const title = $(el).find('a').text().trim()
      const url = $(el).find('a').attr('href') || ''
      const time = $(el).find('.time').text().trim() || ''
      
      if (title) {
        news.push({
          title,
          content: '',
          source: '同花顺',
          pubTime: time,
          url,
          type: categorizeNews(title),
        })
      }
    })
    
    // 如果没有获取到，尝试财经门户
    if (news.length === 0) {
      const sinaUrl = `https://search.sina.com.cn/?q=${symbol}&range=all`
      const sinaRes = await fetch(sinaUrl)
      const sinaHtml = await sinaRes.text()
      const $$ = cheerio.load(sinaHtml)
      
      $$('.news-list .item').each((_, el) => {
        const title = $$(el).find('h2 a').text().trim()
        const url = $$(el).find('h2 a').attr('href') || ''
        
        if (title && title.includes(symbol)) {
          news.push({
            title,
            content: '',
            source: '新浪财经',
            pubTime: '',
            url,
            type: categorizeNews(title),
          })
        }
      })
    }
    
    return news.slice(0, limit)
  } catch (error) {
    console.error('Fetch A stock news error:', error)
    return []
  }
}

// 美股新闻 (Yahoo Finance)
export async function fetchUSStockNews(symbol: string, limit = 20): Promise<NewsItem[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=${limit}`
    const response = await fetch(url)
    const json = await response.json()
    
    if (!json.news) return []
    
    return json.news.map((item: any) => ({
      title: item.title || '',
      content: item.summary || '',
      source: item.publisher || 'Yahoo Finance',
      pubTime: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : '',
      url: item.link || '',
      type: categorizeNews(item.title + ' ' + item.summary),
    }))
  } catch (error) {
    console.error('Fetch US news error:', error)
    return []
  }
}

// 行业新闻
export async function fetchIndustryNews(industry: string, limit = 10): Promise<NewsItem[]> {
  try {
    const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(industry)}&type=14&count=${limit}`
    const response = await fetch(url)
    const json = await response.json()
    
    // 搜索行业相关新闻
    const newsUrl = `https://guba.eastmoney.com/interface,GB_SEARCH&keyword=${encodeURIComponent(industry)}`
    const newsRes = await fetch(newsUrl)
    const newsText = await newsRes.text()
    
    return []
  } catch (error) {
    console.error('Fetch industry news error:', error)
    return []
  }
}

// 宏观经济数据
export async function fetchMacroData(): Promise<{
  gdp?: { value: number; change: number; quarter: string }
  cpi?: { value: number; change: number; month: string }
  pmi?: { value: number; change: number; month: string }
  interestRate?: { value: number; change: number; date: string }
  usdCny?: { value: number; change: number }
}> {
  try {
    // 东方财富宏观经济数据
    const results: any = {}
    
    // GDP数据
    try {
      const gdpUrl = 'https://data.eastmoney.com/cjsj/gdp.aspx'
      const gdpRes = await fetch(gdpUrl)
      const gdpHtml = await gdpRes.text()
      const gdpMatch = gdpHtml.match(/(\d+\.\d+)/)
      if (gdpMatch) {
        results.gdp = { value: parseFloat(gdpMatch[1]), change: 0, quarter: '2024Q3' }
      }
    } catch {}
    
    // CPI数据
    try {
      const cpiUrl = 'https://data.eastmoney.com/cjsj/cpi.aspx'
      const cpiRes = await fetch(cpiUrl)
      const cpiHtml = await cpiRes.text()
      const cpiMatch = cpiHtml.match(/(\d+\.\d+)%/)
      if (cpiMatch) {
        results.cpi = { value: parseFloat(cpiMatch[1]), change: parseFloat(cpiMatch[1]), month: '2024-02' }
      }
    } catch {}
    
    return results
  } catch (error) {
    console.error('Fetch macro data error:', error)
    return {}
  }
}

// 资金流向数据 (港股)
export async function fetchHKCapitalFlow(symbol: string): Promise<{
  mainInflow: number  // 主力净流入
  mainOutflow: number // 主力净流出
  retailInflow: number // 散户净流入
  retailOutflow: number
  netInflow: number // 净流入
  mainRatio: number // 主力占比
}> {
  try {
    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get`
    const params = new URLSearchParams({
      fltt: '2',
      invt: '2',
      fields: 'f1,f2,f3,f4,f7,f8,f9,f10,f12,f13',
      secid: `116.${symbol}`,
    })
    
    const response = await fetch(`${url}?${params}`)
    const json = await response.json()
    
    if (!json.data?.diff?.[0]) {
      return { mainInflow: 0, mainOutflow: 0, retailInflow: 0, retailOutflow: 0, netInflow: 0, mainRatio: 0 }
    }
    
    const data = json.data.diff[0]
    return {
      mainInflow: data.f7 > 0 ? data.f7 : 0,
      mainOutflow: data.f7 < 0 ? Math.abs(data.f7) : 0,
      retailInflow: data.f8 > 0 ? data.f8 : 0,
      retailOutflow: data.f8 < 0 ? Math.abs(data.f8) : 0,
      netInflow: data.f7 || 0,
      mainRatio: data.f10 || 0,
    }
  } catch (error) {
    console.error('Fetch capital flow error:', error)
    return { mainInflow: 0, mainOutflow: 0, retailInflow: 0, retailOutflow: 0, netInflow: 0, mainRatio: 0 }
  }
}

// 资金流向数据 (A股)
export async function fetchAStockCapitalFlow(symbol: string): Promise<{
  mainInflow: number
  mainOutflow: number
  retailInflow: number
  retailOutflow: number
  netInflow: number
  mainRatio: number
}> {
  try {
    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get`
    const params = new URLSearchParams({
      fltt: '2',
      invt: '2',
      fields: 'f1,f2,f3,f4,f7,f8,f9,f10,f12,f13',
      secid: `1.${symbol}`,
    })
    
    const response = await fetch(`${url}?${params}`)
    const json = await response.json()
    
    if (!json.data?.diff?.[0]) {
      return { mainInflow: 0, mainOutflow: 0, retailInflow: 0, retailOutflow: 0, netInflow: 0, mainRatio: 0 }
    }
    
    const data = json.data.diff[0]
    return {
      mainInflow: data.f7 > 0 ? data.f7 : 0,
      mainOutflow: data.f7 < 0 ? Math.abs(data.f7) : 0,
      retailInflow: data.f8 > 0 ? data.f8 : 0,
      retailOutflow: data.f8 < 0 ? Math.abs(data.f8) : 0,
      netInflow: data.f7 || 0,
      mainRatio: data.f10 || 0,
    }
  } catch (error) {
    console.error('Fetch capital flow error:', error)
    return { mainInflow: 0, mainOutflow: 0, retailInflow: 0, retailOutflow: 0, netInflow: 0, mainRatio: 0 }
  }
}

// 行业资金流向
export async function fetchIndustryCapitalFlow(industryCode: string): Promise<{
  netInflow: number
  changePercent: number
  upStocks: number
  downStocks: number
  rank: number
}> {
  try {
    const url = `https://push2.eastmoney.com/api/qt/clist/get`
    const params = new URLSearchParams({
      pn: '1',
      pz: '50',
      fields: 'f1,f2,f3,f4,f12,f13,f104,f105,f106',
      fid: 'f3',
      fs: `m:90+t:2+f:!${industryCode}`,
    })
    
    const response = await fetch(`${url}?${params}`)
    const json = await response.json()
    
    if (!json.data?.diff) {
      return { netInflow: 0, changePercent: 0, upStocks: 0, downStocks: 0, rank: 0 }
    }
    
    const data = json.data.diff
    const upStocks = data.filter((s: any) => s.f3 > 0).length
    const downStocks = data.filter((s: any) => s.f3 < 0).length
    const avgChange = data.reduce((sum: number, s: any) => sum + (s.f3 || 0), 0) / data.length
    
    return {
      netInflow: data.reduce((sum: number, s: any) => sum + (s.f104 || 0), 0),
      changePercent: avgChange,
      upStocks,
      downStocks,
      rank: 0,
    }
  } catch (error) {
    console.error('Fetch industry capital flow error:', error)
    return { netInflow: 0, changePercent: 0, upStocks: 0, downStocks: 0, rank: 0 }
  }
}

// 主力资金流向 (大单/小单)
export async function fetchCapitalFlowDetail(symbol: string, market: 'HK' | 'CN'): Promise<{
  largeInflow: number   // 大单净流入
  mediumInflow: number  // 中单净流入
  smallInflow: number   // 小单净流入
  largeRatio: number   // 大单占比
}> {
  try {
    const secid = market === 'HK' ? `116.${symbol}` : `1.${symbol}`
    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get`
    const params = new URLSearchParams({
      fltt: '2',
      invt: '2',
      fields: 'f1,f2,f3,f4,f7,f8,f9,f10,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72,f73,f74,f75,f76,f77,f78,f79,f80,f81,f82,f83,f84,f85,f86,f87,f88,f89,f90',
      secid,
    })
    
    const response = await fetch(`${url}?${params}`)
    const json = await response.json()
    
    if (!json.data?.diff?.[0]) {
      return { largeInflow: 0, mediumInflow: 0, smallInflow: 0, largeRatio: 0 }
    }
    
    const data = json.data.diff[0]
    // f62-f82 包含各档位资金流向
    return {
      largeInflow: data.f66 || 0,  // 大单净流入
      mediumInflow: data.f68 || 0, // 中单净流入
      smallInflow: data.f70 || 0,  // 小单净流入
      largeRatio: data.f75 || 0,    // 大单占比
    }
  } catch (error) {
    console.error('Fetch capital flow detail error:', error)
    return { largeInflow: 0, mediumInflow: 0, smallInflow: 0, largeRatio: 0 }
  }
}

// 分类新闻类型
function categorizeNews(text: string): NewsItem['type'] {
  const lower = text.toLowerCase()
  
  // 宏观/经济关键词
  const macroKeywords = ['gdp', 'cpi', '降息', '加息', '央行', '利率', '货币政策', '财政', 'gdp', '通胀', '经济']
  if (macroKeywords.some(k => lower.includes(k))) return 'macro'
  
  // 行业关键词
  const industryKeywords = ['行业', '板块', '产业', '赛道', '景气', '供需', '产能']
  if (industryKeywords.some(k => lower.includes(k))) return 'industry'
  
  // 公司关键词
  const companyKeywords = ['财报', '业绩', '营收', '利润', '分红', '收购', '重组', 'ipo', '上市']
  if (companyKeywords.some(k => lower.includes(k))) return 'company'
  
  // 市场关键词
  const marketKeywords = ['大盘', '指数', 'a股', '港股', '美股', '股市', '涨停', '跌停', '牛股']
  if (marketKeywords.some(k => lower.includes(k))) return 'market'
  
  return 'market'
}

// 获取多维度新闻
export async function getMultiDimensionNews(market: 'HK' | 'CN' | 'US', symbol: string): Promise<{
  company: NewsItem[]    // 公司新闻
  industry: NewsItem[]  // 行业新闻
  macro: NewsItem[]     // 宏观新闻
  market: NewsItem[]    // 市场新闻
}> {
  let allNews: NewsItem[] = []
  
  if (market === 'HK') {
    allNews = await fetchHKStockNews(symbol)
  } else if (market === 'CN') {
    allNews = await fetchAStockNews(symbol)
  } else {
    allNews = await fetchUSStockNews(symbol)
  }
  
  return {
    company: allNews.filter(n => n.type === 'company'),
    industry: allNews.filter(n => n.type === 'industry'),
    macro: allNews.filter(n => n.type === 'macro'),
    market: allNews.filter(n => n.type === 'market'),
  }
}

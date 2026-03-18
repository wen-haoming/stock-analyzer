// 新闻数据抓取服务

import * as cheerio from 'cheerio'

// 东方财富股吧新闻
export async function fetchStockNews(market: 'HK' | 'CN' | 'US', symbol: string) {
  try {
    let url = ''
    
    if (market === 'HK') {
      url = `https://guba.eastmoney.com/list,${symbol}.html`
    } else if (market === 'CN') {
      url = `https://guba.eastmoney.com/list,${symbol}.html`
    } else {
      url = `https://finance.yahoo.com/quote/${symbol}/news`
    }

    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const news: any[] = []

    if (market === 'US') {
      $('.news-item').each((_, el) => {
        const title = $(el).find('h3').text()
        const link = $(el).find('a').attr('href')
        const time = $(el).find('.发布时间').text()
        
        if (title && link) {
          news.push({
            title: title.trim(),
            url: link.startsWith('http') ? link : `https://finance.yahoo.com${link}`,
            pubDate: time || new Date().toISOString(),
            source: 'Yahoo Finance',
          })
        }
      })
    } else {
      // 东方财富
      $('#articlelistnew .articleh').each((_, el) => {
        const title = $(el).find('.title a').text()
        const link = $(el).find('.title a').attr('href')
        const author = $(el).('.author').text()
        const date = $(el).find('.date').text()
        
        if (title && link) {
          news.push({
            title: title.trim(),
            url: link.startsWith('http') ? link : `https://guba.eastmoney.com${link}`,
            pubDate: date || new Date().toISOString(),
            source: '东方财富',
          })
        }
      })
    }

    return news.slice(0, 20)
  } catch (error) {
    console.error('Fetch news error:', error)
    return []
  }
}

// 获取新闻详情
export async function fetchNewsDetail(url: string) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // 提取正文内容
    let content = ''
    
    if (url.includes('eastmoney')) {
      content = $('#newbody').text() || $('.stockcodec').text() || ''
    } else if (url.includes('yahoo')) {
      content = $('.caas-body').text() || ''
    }

    return content.trim().slice(0, 2000)
  } catch (error) {
    console.error('Fetch news detail error:', error)
    return ''
  }
}

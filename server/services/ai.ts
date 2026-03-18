// AI 分析服务 - MiniMax 2.7 + Vercel AI SDK
// 支持思维链显示

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || ''
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1'

// 思维链步骤
interface ThinkStep {
  title: string
  content: string
  status: 'pending' | 'thinking' | 'completed'
}

// 股票分析结果
interface AnalysisResult {
  conclusion: string
  confidence: number
  factors: {
    name: string
    weight: number
    reason: string
  }[]
  thinkingChain: ThinkStep[]
}

// 调用 MiniMax API
async function callMiniMax(prompt: string): Promise<string> {
  if (!MINIMAX_API_KEY) {
    return '请配置 MINIMAX_API_KEY 环境变量'
  }

  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01', // MiniMax 2.7
        messages: [
          { role: 'system', content: '你是一个专业的股票分析师，擅长分析股票走势的影响因素。' },
          { role: 'user', content: prompt }
        ]
      })
    })

    const result = await response.json()
    return result.choices?.[0]?.message?.content || 'AI 分析失败'
  } catch (error) {
    console.error('MiniMax API error:', error)
    return 'AI 服务调用失败'
  }
}

// 1. 当日走势分析
export async function analyzeToday(
  market: 'HK' | 'CN' | 'US',
  symbol: string,
  klineData: any[],
  news: any[]
): Promise<AnalysisResult> {
  const thinkingChain: ThinkStep[] = [
    { title: '数据收集', content: '收集K线数据和新闻', status: 'completed' },
    { title: '价格分析', content: '分析当日价格走势', status: 'thinking' },
    { title: '因素提取', content: '提取影响因素', status: 'pending' },
    { title: '权重计算', content: '计算各因素权重', status: 'pending' },
    { title: '得出结论', content: '综合分析给出结论', status: 'pending' },
  ]

  if (klineData.length === 0) {
    return {
      conclusion: '暂无数据',
      confidence: 0,
      factors: [],
      thinkingChain,
    }
  }

  const today = klineData[klineData.length - 1]
  const change = ((today.close - today.open) / today.open * 100).toFixed(2)
  const isUp = today.close >= today.open

  thinkingChain[1].content = `当日涨幅${change}%，${isUp ? '上涨' : '下跌'}`

  // 构建分析提示
  const prompt = `
请分析以下股票的当日走势影响因素：

股票代码: ${symbol}
市场: ${market}
日期: ${today.time}
开盘价: ${today.open}
收盘价: ${today.close}
最高价: ${today.high}
最低价: ${today.low}
涨跌幅: ${change}%

相关新闻:
${news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join('\n')}

请分析并给出:
1. 主要影响因素（大盘/新闻/宏观/政策/技术面等）
2. 各因素权重（百分比，总和100%）
3. 简短结论

请按以下JSON格式返回:
{
  "factors": [
    {"name": "因素名", "weight": 权重, "reason": "原因"}
  ],
  "conclusion": "简短结论"
}
`

  thinkingChain[2].status = 'thinking'
  const result = await callMiniMax(prompt)

  // 解析结果
  let factors: any[] = []
  let conclusion = result

  try {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match)
      factors = parsed.factors || []
      conclusion = parsed.conclusion || result
    }
  } catch (e) {
    console.error('Parse error:', e)
  }

  thinkingChain[2].status = 'completed'
  thinkingChain[3].status = 'completed'
  thinkingChain[4].status = 'completed'

  return {
    conclusion,
    confidence: 0.75,
    factors,
    thinkingChain,
  }
}

// 2. 区间涨跌分析
export async function analyzeRange(
  market: 'HK' | 'CN' | 'US',
  symbol: string,
  startDate: string,
  endDate: string,
  klineData: any[],
  news: any[]
): Promise<AnalysisResult> {
  const thinkingChain: ThinkStep[] = [
    { title: '数据收集', content: '收集区间K线数据和新闻', status: 'completed' },
    { title: '趋势分析', content: '分析区间整体趋势', status: 'thinking' },
    { title: '因素分析', content: '分析各因素影响', status: 'pending' },
    { title: '归因', content: '归因分析', status: 'pending' },
    { title: '结论', content: '综合得出结论', status: 'pending' },
  ]

  if (klineData.length < 2) {
    return {
      conclusion: '数据不足',
      confidence: 0,
      factors: [],
      thinkingChain,
    }
  }

  const startPrice = klineData[0].close
  const endPrice = klineData[klineData.length - 1].close
  const totalChange = ((endPrice - startPrice) / startPrice * 100).toFixed(2)

  thinkingChain[1].content = `区间涨幅${totalChange}%`

  const prompt = `
请分析以下股票在 ${startDate} 至 ${endDate} 期间的涨跌原因：

股票代码: ${symbol}
市场: ${market}
起始价: ${startPrice}
结束价: ${endPrice}
涨跌幅: ${totalChange}%
K线数量: ${klineData.length}根

相关新闻摘要:
${news.slice(0, 10).map((n, i) => `${i + 1}. ${n.title}`).join('\n')}

请分析:
1. 主要影响因素（技术面/主力资金/外部因素/业绩/政策/大盘等）
2. 各因素权重占比
3. 归因分析

请按JSON格式返回:
{
  "factors": [
    {"name": "因素", "weight": 百分比, "reason": "原因"}
  ],
  "conclusion": "结论"
}
`

  thinkingChain[2].status = 'thinking'
  const result = await callMiniMax(prompt)

  let factors: any[] = []
  let conclusion = result

  try {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match)
      factors = parsed.factors || []
      conclusion = parsed.conclusion || result
    }
  } catch (e) {
    console.error('Parse error:', e)
  }

  thinkingChain.forEach((_, i) => {
    if (thinkingChain[i].status !== 'completed') {
      thinkingChain[i].status = 'completed'
    }
  })

  return {
    conclusion,
    confidence: 0.7,
    factors,
    thinkingChain,
  }
}

// 3. 未来走势预测
export async function predictFuture(
  market: 'HK' | 'CN' | 'US',
  symbol: string,
  klineData: any[],
  news: any[]
): Promise<{
  predictions: { horizon: string; direction: string; confidence: number; reason: string }[]
  thinkingChain: ThinkStep[]
}> {
  const thinkingChain: ThinkStep[] = [
    { title: '历史分析', content: '分析历史走势特征', status: 'completed' },
    { title: '模式识别', content: '识别价格模式', status: 'thinking' },
    { title: '趋势外推', content: '趋势外推预测', status: 'pending' },
    { title: '新闻影响', content: '评估新闻影响', status: 'pending' },
    { title: '综合预测', content: '综合给出预测', status: 'pending' },
  ]

  if (klineData.length < 10) {
    return {
      predictions: [],
      thinkingChain,
    }
  }

  // 计算技术指标
  const recentData = klineData.slice(-30)
  const prices = recentData.map(d => d.close)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const currentPrice = prices[prices.length - 1]
  const trend = currentPrice > avgPrice ? '上涨趋势' : currentPrice < avgPrice ? '下跌趋势' : '横盘'

  thinkingChain[1].content = `当前处于${trend}，均价${avgPrice.toFixed(2)}`

  const prompt = `
请预测以下股票的未来走势：

股票代码: ${symbol}
市场: ${market}
当前价格: ${currentPrice}
近期均价: ${avgPrice.toFixed(2)}
趋势: ${trend}
近期数据点数: ${klineData.length}

近期新闻:
${news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join('\n')}

请预测:
1. T+1 (明天) 走势
2. T+3 (3天后) 走势  
3. T+5 (5天后) 走势

请按JSON格式返回:
{
  "predictions": [
    {"horizon": "T+1", "direction": "上涨/下跌/震荡", "confidence": 置信度0-1, "reason": "原因"},
    {"horizon": "T+3", "direction": "...", "confidence": ..., "reason": "..."},
    {"horizon": "T+5", "direction": "...", "confidence": ..., "reason": "..."}
  ]
}
`

  thinkingChain[2].status = 'thinking'
  const result = await callMiniMax(prompt)

  let predictions: any[] = []

  try {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match)
      predictions = parsed.predictions || []
    }
  } catch (e) {
    console.error('Parse error:', e)
  }

  thinkingChain.forEach((_, i) => {
    if (thinkingChain[i].status !== 'completed') {
      thinkingChain[i].status = 'completed'
    }
  })

  return {
    predictions,
    thinkingChain,
  }
}

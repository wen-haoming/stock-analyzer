import { useState, useEffect } from 'react'
import { Layout, Select, Card, Space, Tag, Spin, message } from 'antd'
import { LineChartOutlined, StockOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import KLineChart from './components/KLineChart'
import AnalysisPanel from './components/AnalysisPanel'

const { Header, Content, Sider } = Layout

// 简单的状态管理
const useStockStore = () => {
  const [market, setMarket] = useState<'HK' | 'CN' | 'US'>('HK')
  const [selectedStock, setSelectedStock] = useState<{symbol: string; name: string} | null>(null)
  const [klineData, setKlineData] = useState<any[]>([])
  const [klineType, setKlineType] = useState<'101' | '102' | '103'>('101')
  const [loading, setLoading] = useState(false)
  return { market, setMarket, selectedStock, setSelectedStock, klineData, setKlineData, klineType, setKlineType, loading, setLoading }
}

const store = useStockStore

export default function App() {
  const { market, setMarket, selectedStock, setSelectedStock, klineData, setKlineData, klineType, setKlineType, loading, setLoading } = store()
  const [searchResults, setSearchResults] = useState<any[]>([])

  const searchStocks = async (keyword: string) => {
    if (!keyword) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/stocks?search=${encodeURIComponent(keyword)}&market=${market}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (e) { console.error(e) }
  }

  const loadKline = async (symbol: string) => {
    setLoading(true)
    try {
      const end = dayjs().format('YYYY-MM-DD')
      const start = dayjs().subtract(90, 'day').format('YYYY-MM-DD')
      const res = await fetch(`/api/stocks/kline?market=${market}&symbol=${symbol}&start=${start}&end=${end}&kline=${klineType}`)
      const data = await res.json()
      setKlineData(data.data || [])
    } catch (e) { message.error('加载失败') }
    finally { setLoading(false) }
  }

  useEffect(() => { selectedStock && loadKline(selectedStock.symbol) }, [klineType])

  const analyze = async (type: string, params: any) => {
    const res = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...params }),
    })
    return res.json()
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{ color: '#fff', margin: 0 }}>📈 AI 股票分析</h1>
        <Select value={market} onChange={setMarket} style={{ width: 100 }}
          options={[{ value: 'HK', label: '港股' }, { value: 'CN', label: 'A股' }, { value: 'US', label: '美股' }]} />
        <Select showSearch placeholder={`搜索${market}股票`} style={{ width: 300 }}
          onSearch={searchStocks}
          onSelect={(symbol) => { const s = searchResults.find(x => x.symbol === symbol); if (s) { setSelectedStock(s); loadKline(s.symbol) }}}
          options={searchResults.map(s => ({ value: s.symbol, label: `${s.name} (${s.symbol})` }))} />
        <span style={{ color: '#fff', marginLeft: 'auto' }}>MiniMax 2.7 + 思维链</span>
      </Header>
      
      <Layout>
        <Sider width={320} style={{ background: '#fff', padding: 16 }}>
          {selectedStock ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small">
                <StockOutlined /><span style={{ fontWeight: 'bold', marginLeft: 8 }}>{selectedStock.name}</span>
                <Tag style={{ marginLeft: 8 }}>{selectedStock.symbol}</Tag>
              </Card>
              <Select value={klineType} onChange={setKlineType} style={{ width: '100%' }}
                options={[{ value: '101', label: '日K' }, { value: '102', label: '周K' }, { value: '103', label: '月K' }]} />
              <AnalysisPanel market={market} symbol={selectedStock.symbol} klineData={klineData} onAnalyze={analyze} />
            </Space>
          ) : <div style={{ color: '#999', textAlign: 'center', marginTop: 100 }}>请搜索选择股票</div>}
        </Sider>
        
        <Content style={{ padding: 16 }}>
          {loading ? <div style={{ textAlign: 'center', marginTop: 200 }}><Spin size="large" /></div> :
           klineData.length > 0 ? <Card title={<><LineChartOutlined /> K线图</>}><KLineChart data={klineData} height={500} /></Card> :
           <div style={{ color: '#999', textAlign: 'center', marginTop: 200 }}><LineChartOutlined style={{ fontSize: 64 }} /><div>选择股票查看K线</div></div>}
        </Content>
      </Layout>
    </Layout>
  )
}

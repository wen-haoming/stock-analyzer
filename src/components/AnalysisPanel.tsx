import { useState } from 'react'
import { Card, Tabs, Button, DatePicker, Progress, Tag, Space, message } from 'antd'
import { RocketOutlined, LineChartOutlined, ExperimentOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ThinkingChain from './ThinkingChain'

const { RangePicker } = DatePicker

interface AnalysisPanelProps {
  market: 'HK' | 'CN' | 'US'
  symbol: string
  klineData: any[]
  onAnalyze: (type: 'today' | 'range' | 'predict', params: any) => Promise<any>
}

export default function AnalysisPanel({ market, symbol, onAnalyze }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('today')
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState<[string, string]>([
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ])
  
  const [result, setResult] = useState<any>(null)

  const handleAnalysis = async (type: 'today' | 'range' | 'predict') => {
    setLoading(true)
    try {
      const params: any = { market, symbol, klineType: '101' }
      if (type === 'range') {
        params.startDate = range[0]
        params.endDate = range[1]
      }
      const data = await onAnalyze(type, params)
      setResult(data)
      message.success('分析完成')
    } catch (e) {
      message.error('分析失败')
    } finally {
      setLoading(false)
    }
  }

  const renderFactors = (factors: any[]) => (
    <Space direction="vertical" style={{ width: '100%' }}>
      {factors?.map((factor, i) => (
        <div key={i} style={{ padding: 8, background: '#fafafa', borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Tag color={factor.weight > 30 ? 'red' : factor.weight > 15 ? 'orange' : 'blue'}>
              {factor.name}
            </Tag>
            <span>{factor.weight}%</span>
          </div>
          <Progress percent={factor.weight} showInfo={false} size="small" />
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{factor.reason}</div>
        </div>
      ))}
    </Space>
  )

  return (
    <Card>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'today',
            label: <span><LineChartOutlined /> 当日分析</span>,
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" icon={<RocketOutlined />} onClick={() => handleAnalysis('today')} loading={loading} block>
                  分析当日走势
                </Button>
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                {result?.factors && <Card size="small" title="影响因素">{renderFactors(result.factors)}</Card>}
                {result?.conclusion && <Card size="small" title="结论"><div style={{ color: '#52c41a' }}>{result.conclusion}</div></Card>}
              </Space>
            ),
          },
          {
            key: 'range',
            label: <span><ExperimentOutlined /> 区间分析</span>,
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <RangePicker 
                  value={[dayjs(range[0]), dayjs(range[1])]}
                  onChange={(dates) => dates && setRange([dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')])}
                  style={{ width: '100%' }}
                />
                <Button type="primary" icon={<RocketOutlined />} onClick={() => handleAnalysis('range')} loading={loading} block>
                  分析区间涨跌
                </Button>
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                {result?.factors && <Card size="small" title="归因分析">{renderFactors(result.factors)}</Card>}
                {result?.conclusion && <Card size="small" title="结论"><div style={{ color: '#52c41a' }}>{result.conclusion}</div></Card>}
              </Space>
            ),
          },
          {
            key: 'predict',
            label: <span><RocketOutlined /> 走势预测</span>,
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" icon={<RocketOutlined />} onClick={() => handleAnalysis('predict')} loading={loading} block>
                  预测未来走势
                </Button>
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                {result?.predictions && (
                  <Card size="small" title="预测结果">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {result.predictions.map((p: any, i: number) => (
                        <div key={i} style={{ padding: 8, background: '#fafafa', borderRadius: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Tag color={p.direction === '上涨' ? 'red' : p.direction === '下跌' ? 'green' : 'orange'}>{p.horizon}</Tag>
                            <span>{p.direction}</span>
                          </div>
                          <Progress percent={Math.round(p.confidence * 100)} size="small" />
                          <div style={{ fontSize: 12, color: '#999' }}>{p.reason}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                )}
              </Space>
            ),
          },
        ]}
      />
    </Card>
  )
}

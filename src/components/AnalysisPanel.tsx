import { useState } from 'react'
import { Card, Tabs, Button, DatePicker, Progress, Tag, Space, Collapse, Row, Col, Badge, message } from 'antd'
import { RocketOutlined, LineChartOutlined, ExperimentOutlined, FundOutlined, GlobalOutlined, MoneyCollectOutlined, ReadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ThinkingChain from './ThinkingChain'

const { RangePicker } = DatePicker
const { Panel } = Collapse

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
      message.error('分析失败: ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  // 渲染技术分析卡片
  const renderTechnical = (tech: any) => (
    <Card size="small" title={<><FundOutlined /> 技术分析</>}>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Tag color={tech.trend === 'up' ? 'red' : tech.trend === 'down' ? 'green' : 'orange'}>
            {tech.trend === 'up' ? '上涨趋势' : tech.trend === 'down' ? '下跌趋势' : '横盘震荡'}
          </Tag>
        </Col>
        <Col span={12}>
          <span>波动率: {tech.volatility?.toFixed(2)}%</span>
        </Col>
        <Col span={12}>
          <span>支撑位: {tech.support?.toFixed(2)}</span>
        </Col>
        <Col span={12}>
          <span>阻力位: {tech.resistance?.toFixed(2)}</span>
        </Col>
      </Row>
      {tech.signals?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Tag>技术信号</Tag>
          {tech.signals.map((s: string, i: number) => <Tag key={i} color="blue">{s}</Tag>)}
        </div>
      )}
      {tech.kdjSignals?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Tag>KDJ信号</Tag>
          {tech.kdjSignals.map((s: string, i: number) => <Tag key={i} color="purple">{s}</Tag>)}
        </div>
      )}
    </Card>
  )

  // 渲染新闻分析卡片
  const renderNews = (news: any) => (
    <Card size="small" title={<><ReadOutlined /> 新闻分析</>}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={8}>
          <Col span={12}>
            <Badge count={news.company?.count || 0} style={{ backgroundColor: '#1890ff' }}>
              <Tag>公司</Tag>
            </Badge>
            <Tag color={news.company?.sentiment === 'positive' ? 'green' : news.company?.sentiment === 'negative' ? 'red' : 'default'}>
              {news.company?.sentiment === 'positive' ? '正面' : news.company?.sentiment === 'negative' ? '负面' : '中性'}
            </Tag>
          </Col>
          <Col span={12}>
            <Badge count={news.industry?.count || 0} style={{ backgroundColor: '#52c41a' }}>
              <Tag>行业</Tag>
            </Badge>
            <Tag color={news.industry?.sentiment === 'positive' ? 'green' : news.industry?.sentiment === 'negative' ? 'red' : 'default'}>
              {news.industry?.sentiment === 'positive' ? '正面' : news.industry?.sentiment === 'negative' ? '负面' : '中性'}
            </Tag>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Badge count={news.macro?.count || 0} style={{ backgroundColor: '#faad14' }}>
              <Tag>宏观</Tag>
            </Badge>
            <Tag color={news.macro?.sentiment === 'positive' ? 'green' : news.macro?.sentiment === 'negative' ? 'red' : 'default'}>
              {news.macro?.sentiment === 'positive' ? '正面' : news.macro?.sentiment === 'negative' ? '负面' : '中性'}
            </Tag>
          </Col>
          <Col span={12}>
            <Badge count={news.market?.count || 0} style={{ backgroundColor: '#f5222d' }}>
              <Tag>市场</Tag>
            </Badge>
            <Tag color={news.market?.sentiment === 'positive' ? 'green' : news.market?.sentiment === 'negative' ? 'red' : 'default'}>
              {news.market?.sentiment === 'positive' ? '正面' : news.market?.sentiment === 'negative' ? '负面' : '中性'}
            </Tag>
          </Col>
        </Row>
      </Space>
    </Card>
  )

  // 渲染宏观分析卡片
  const renderMacro = (macro: any) => (
    <Card size="small" title={<><GlobalOutlined /> 宏观分析</>}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {macro.gdp && (
          <Row>
            <Col span={12}>GDP: {macro.gdp.value}万亿</Col>
            <Col span={12}>
              <Tag color={macro.gdp.change > 0 ? 'green' : 'red'}>
                {macro.gdp.change > 0 ? '+' : ''}{macro.gdp.change}%
              </Tag>
            </Col>
          </Row>
        )}
        {macro.cpi && (
          <Row>
            <Col span={12}>CPI: {macro.cpi.value}%</Col>
            <Col span={12}>
              <Tag color={macro.cpi.change > 0 ? 'orange' : 'green'}>
                {macro.cpi.change > 0 ? '+' : ''}{macro.cpi.change}%
              </Tag>
            </Col>
          </Row>
        )}
        <div style={{ marginTop: 8 }}>{macro.assessment || '暂无宏观数据'}</div>
      </Space>
    </Card>
  )

  // 渲染资金流向卡片
  const renderCapital = (capital: any) => (
    <Card size="small" title={<><MoneyCollectOutlined /> 资金流向</>}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={8}>
          <Col span={12}>
            <div>主力净流入</div>
            <div style={{ color: capital?.netInflow > 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
              {capital?.netInflow > 0 ? '+' : ''}{(capital?.netInflow / 10000).toFixed(2)}万
            </div>
          </Col>
          <Col span={12}>
            <div>大单占比</div>
            <div style={{ fontWeight: 'bold' }}>{capital?.largeRatio || 0}%</div>
          </Col>
        </Row>
        <Progress 
          percent={capital?.largeRatio || 0} 
          format={p => `大单 ${p}%`}
          strokeColor="#1890ff"
        />
        <div>{capital?.assessment || '暂无资金数据'}</div>
      </Space>
    </Card>
  )

  // 渲染影响因素
  const renderFactors = (factors: any[]) => (
    <Card size="small" title="影响因素权重">
      <Space direction="vertical" style={{ width: '100%' }}>
        {factors?.map((factor, i) => (
          <div key={i} style={{ padding: 8, background: '#fafafa', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Space>
                <Tag color={
                  factor.category === 'technical' ? 'blue' :
                  factor.category === 'news' ? 'purple' :
                  factor.category === 'macro' ? 'orange' :
                  factor.category === 'industry' ? 'cyan' : 'gold'
                }>
                  {factor.category === 'technical' ? '技术' :
                   factor.category === 'news' ? '新闻' :
                   factor.category === 'macro' ? '宏观' :
                   factor.category === 'industry' ? '行业' : '资金'}
                </Tag>
                <span>{factor.name}</span>
              </Space>
              <span>{factor.weight}%</span>
            </div>
            <Progress 
              percent={factor.weight} 
              showInfo={false} 
              size="small"
              strokeColor={
                factor.direction === 'positive' ? '#52c41a' :
                factor.direction === 'negative' ? '#f5222d' : '#faad14'
              }
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{factor.reason}</div>
          </div>
        ))}
      </Space>
    </Card>
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
                <Button 
                  type="primary" 
                  icon={<RocketOutlined />} 
                  onClick={() => handleAnalysis('today')} 
                  loading={loading} 
                  block
                >
                  开始多维度分析
                </Button>
                
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                
                {result && (
                  <Collapse ghost>
                    <Panel header="📊 分析详情" key="details">
                      {result.technical && renderTechnical(result.technical)}
                      {result.news && renderNews(result.news)}
                      {result.macro && renderMacro(result.macro)}
                      {result.capital && renderCapital(result.capital)}
                    </Panel>
                  </Collapse>
                )}
                
                {result?.factors && renderFactors(result.factors)}
                
                {result?.conclusion && (
                  <Card size="small" title="📝 综合结论" style={{ background: '#f6ffed' }}>
                    <div style={{ color: '#52c41a', fontWeight: 'bold' }}>{result.conclusion}</div>
                    <div style={{ marginTop: 8 }}>
                      置信度: <Progress percent={Math.round((result.confidence || 0.7) * 100)} size="small" />
                    </div>
                  </Card>
                )}
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
                  onChange={(dates) => dates && setRange([
                    dates[0]!.format('YYYY-MM-DD'), 
                    dates[1]!.format('YYYY-MM-DD')
                  ])}
                  style={{ width: '100%' }}
                />
                <Button 
                  type="primary" 
                  icon={<RocketOutlined />} 
                  onClick={() => handleAnalysis('range')} 
                  loading={loading} 
                  block
                >
                  区间多维度分析
                </Button>
                
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                
                {result && (
                  <Collapse ghost>
                    <Panel header="📊 分析详情" key="details">
                      {result.technical && renderTechnical(result.technical)}
                      {result.news && renderNews(result.news)}
                      {result.macro && renderMacro(result.macro)}
                      {result.capital && renderCapital(result.capital)}
                    </Panel>
                  </Collapse>
                )}
                
                {result?.factors && renderFactors(result.factors)}
                
                {result?.conclusion && (
                  <Card size="small" title="📝 归因结论" style={{ background: '#f6ffed' }}>
                    <div style={{ color: '#52c41a' }}>{result.conclusion}</div>
                  </Card>
                )}
              </Space>
            ),
          },
          {
            key: 'predict',
            label: <span><RocketOutlined /> 走势预测</span>,
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<RocketOutlined />} 
                  onClick={() => handleAnalysis('predict')} 
                  loading={loading} 
                  block
                >
                  AI走势预测
                </Button>
                
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                
                {result?.predictions && (
                  <Card size="small" title="📈 预测结果">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {result.predictions.map((p: any, i: number) => (
                        <div key={i} style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Tag color={p.direction === '上涨' ? 'red' : p.direction === '下跌' ? 'green' : 'orange'} style={{ fontSize: 14 }}>
                              {p.horizon}
                            </Tag>
                            <span style={{ fontWeight: 'bold' }}>{p.direction}</span>
                          </div>
                          <Progress percent={Math.round((p.confidence || 0) * 100)} format={() => `${Math.round((p.confidence || 0) * 100)}%`} />
                          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{p.reason}</div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                )}
                
                {result?.conclusion && (
                  <Card size="small" title="📝 预测总结" style={{ background: '#e6f7ff' }}>
                    <div style={{ color: '#1890ff' }}>{result.conclusion}</div>
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

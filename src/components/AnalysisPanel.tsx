import { useState } from 'react'
import { Card, Tabs, Button, DatePicker, Progress, Tag, Space, Collapse, Row, Col, message, Tooltip } from 'antd'
import { RocketOutlined, LineChartOutlined, ExperimentOutlined, FundOutlined, MoneyCollectOutlined } from '@ant-design/icons'
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

  // 渲染技术指标卡片 (含相关度)
  const renderTechnicalIndicators = (tech: any) => (
    <Card size="small" title={<><FundOutlined /> 技术指标分析 <Tooltip title="各指标与股价的相关度"><Tag color="blue">?</Tag></Tooltip></>}>
      <Collapse ghost>
        <Panel header="📊 均线系统" key="ma">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>MA5</div><div style={{fontWeight:'bold'}}>{tech.ma?.ma5?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>MA10</div><div style={{fontWeight:'bold'}}>{tech.ma?.ma10?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>MA20</div><div style={{fontWeight:'bold'}}>{tech.ma?.ma20?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>MA60</div><div style={{fontWeight:'bold'}}>{tech.ma?.ma60?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>趋势</div><Tag color={tech.maTrend === 'up' ? 'red' : tech.maTrend === 'down' ? 'green' : 'orange'}>{tech.maTrend === 'up' ? '多头' : tech.maTrend === 'down' ? '空头' : '横盘'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.maCorrelation * 100)}%</Tag></Col>
          </Row>
        </Panel>
        
        <Panel header="📉 MACD指标" key="macd">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>DIF</div><div style={{fontWeight:'bold'}}>{tech.macd?.dif?.toFixed(3)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>DEA</div><div style={{fontWeight:'bold'}}>{tech.macd?.dea?.toFixed(3)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>MACD柱</div><div style={{fontWeight:'bold',color:tech.macd?.macd > 0 ? '#f5222d' : '#52c41a'}}>{tech.macd?.macd?.toFixed(3)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>信号</div><Tag color={tech.macd?.signal === 'golden' ? 'red' : tech.macd?.signal === 'death' ? 'green' : 'default'}>{tech.macd?.signal === 'golden' ? '金叉' : tech.macd?.signal === 'death' ? '死叉' : '观望'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.macdCorrelation * 100)}%</Tag></Col>
            <Col span={8}></Col>
          </Row>
        </Panel>
        
        <Panel header="📊 RSI指标" key="rsi">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>RSI(6)</div><div style={{fontWeight:'bold'}}>{tech.rsi?.rsi6?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>RSI(12)</div><div style={{fontWeight:'bold'}}>{tech.rsi?.rsi12?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>RSI(24)</div><div style={{fontWeight:'bold'}}>{tech.rsi?.rsi24?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>信号</div><Tag color={tech.rsi?.signal === 'oversold' ? 'green' : tech.rsi?.signal === 'overbought' ? 'red' : 'default'}>{tech.rsi?.signal === 'oversold' ? '超卖' : tech.rsi?.signal === 'overbought' ? '超买' : '正常'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.rsiCorrelation * 100)}%</Tag></Col>
          </Row>
        </Panel>
        
        <Panel header="📈 BOLL布林带" key="boll">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>上轨</div><div style={{fontWeight:'bold'}}>{tech.boll?.upper?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>中轨</div><div style={{fontWeight:'bold'}}>{tech.boll?.middle?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>下轨</div><div style={{fontWeight:'bold'}}>{tech.boll?.lower?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>位置</div><Tag>{Math.round(tech.boll?.position * 100)}%</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>信号</div><Tag color={tech.boll?.signal === 'lower' ? 'green' : tech.boll?.signal === 'upper' ? 'red' : 'default'}>{tech.boll?.signal === 'lower' ? '触及下轨' : tech.boll?.signal === 'upper' ? '触及上轨' : '中轨运行'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.bollCorrelation * 100)}%</Tag></Col>
          </Row>
        </Panel>
        
        <Panel header="📊 KDJ指标" key="kdj">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>K值</div><div style={{fontWeight:'bold'}}>{tech.kdj?.k?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>D值</div><div style={{fontWeight:'bold'}}>{tech.kdj?.d?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>J值</div><div style={{fontWeight:'bold',color:tech.kdj?.j > 100 ? '#f5222d' : tech.kdj?.j < 0 ? '#52c41a' : '#333'}}>{tech.kdj?.j?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>信号</div><Tag color={tech.kdj?.signal === 'golden' ? 'red' : tech.kdj?.signal === 'death' ? 'green' : 'default'}>{tech.kdj?.signal === 'golden' ? '金叉' : tech.kdj?.signal === 'death' ? '死叉' : '观望'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.kdjCorrelation * 100)}%</Tag></Col>
          </Row>
        </Panel>
        
        <Panel header="📊 成交量" key="volume">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>成交量</div><div style={{fontWeight:'bold'}}>{(tech.volume?.volume / 10000).toFixed(0)}万</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>5日均量</div><div style={{fontWeight:'bold'}}>{(tech.volume?.avgVolume5 / 10000).toFixed(0)}万</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>量比</div><div style={{fontWeight:'bold'}}>{tech.volume?.volumeRatio?.toFixed(2)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>换手率</div><div style={{fontWeight:'bold'}}>{tech.volume?.turnover?.toFixed(2)}%</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>信号</div><Tag color={tech.volume?.signal === 'up' ? 'red' : tech.volume?.signal === 'down' ? 'green' : 'default'}>{tech.volume?.signal === 'up' ? '放量' : tech.volume?.signal === 'down' ? '缩量' : '正常'}</Tag></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>相关度</div><Tag>{Math.round(tech.volumeCorrelation * 100)}%</Tag></Col>
          </Row>
        </Panel>
        
        <Panel header="📊 其他指标" key="others">
          <Row gutter={[8, 8]}>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>威廉WR</div><div style={{fontWeight:'bold'}}>{tech.wr?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>CCI</div><div style={{fontWeight:'bold'}}>{tech.cci?.toFixed(1)}</div></Col>
            <Col span={8}><div style={{fontSize:12,color:'#999'}}>VR</div><div style={{fontWeight:'bold'}}>{tech.vr?.toFixed(0)}</div></Col>
          </Row>
        </Panel>
      </Collapse>
      
      <div style={{marginTop:12,padding:12,background:'#fafafa',borderRadius:6}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>综合评分</span>
          <Tag color={tech.overallSignal === 'buy' ? 'red' : tech.overallSignal === 'sell' ? 'green' : 'orange'} style={{fontSize:16}}>
            {tech.overallScore?.toFixed(0)}分
          </Tag>
        </div>
        <Progress 
          percent={tech.overallScore} 
          showInfo={false}
          strokeColor={tech.overallSignal === 'buy' ? '#f5222d' : tech.overallSignal === 'sell' ? '#52c41a' : '#faad14'}
        />
        <div style={{fontSize:12,color:'#666',textAlign:'center'}}>
          信号: {tech.overallSignal === 'buy' ? '🟢 买入' : tech.overallSignal === 'sell' ? '🔴 卖出' : '🟡 观望'}
        </div>
      </div>
    </Card>
  )

  // 渲染所有因素 (含相关度)
  const renderAllFactors = (factors: any[]) => (
    <Card size="small" title="⚖️ 完整因素分析 (含相关度)">
      <Space direction="vertical" style={{ width: '100%' }}>
        {factors?.map((factor, i) => (
          <div key={i} style={{ padding: 10, background: '#fafafa', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Space>
                <Tag color={
                  factor.category === 'technical' ? 'blue' :
                  factor.category === 'financial' ? 'purple' :
                  factor.category === 'capital' ? 'gold' :
                  factor.category === 'macro' ? 'cyan' :
                  factor.category === 'news' ? 'green' : 'default'
                } style={{fontSize:11}}>
                  {factor.category === 'technical' ? '技术' :
                   factor.category === 'financial' ? '财务' :
                   factor.category === 'capital' ? '资金' :
                   factor.category === 'macro' ? '宏观' :
                   factor.category === 'news' ? '新闻' : '情绪'}
                </Tag>
                <span style={{fontWeight:500}}>{factor.name}</span>
              </Space>
              <Tag color={
                factor.direction === 'positive' ? 'green' :
                factor.direction === 'negative' ? 'red' : 'default'
              }>
                {factor.direction === 'positive' ? '正向' : factor.direction === 'negative' ? '负向' : '中性'}
              </Tag>
            </div>
            
            <div style={{fontSize:12,color:'#666',marginBottom:6}}>{factor.description}</div>
            
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2}}>
                  <span>权重</span>
                  <span>{factor.weight}%</span>
                </div>
                <Progress percent={factor.weight} showInfo={false} size="small" strokeColor="#1890ff" />
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:2}}>
                  <span>相关度</span>
                  <span style={{color:factor.correlation > 0 ? '#52c41a' : factor.correlation < 0 ? '#f5222d' : '#999'}}>
                    {factor.correlation > 0 ? '+' : ''}{(factor.correlation * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  percent={Math.abs(factor.correlation) * 100} 
                  showInfo={false} 
                  size="small" 
                  strokeColor={factor.correlation > 0 ? '#52c41a' : factor.correlation < 0 ? '#f5222d' : '#999'} 
                />
              </div>
            </div>
            
            <div style={{fontSize:11,color:'#999',marginTop:4,textAlign:'right'}}>
              信号: {factor.signal}
            </div>
          </div>
        ))}
      </Space>
    </Card>
  )

  // 渲染资金流向
  const renderCapital = (capital: any) => (
    <Card size="small" title={<><MoneyCollectOutlined /> 资金流向</>}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={8}>
          <Col span={12}>
            <div>主力净流入</div>
            <div style={{ color: capital?.netInflow > 0 ? '#f5222d' : '#52c41a', fontWeight: 'bold', fontSize: 18 }}>
              {capital?.netInflow > 0 ? '+' : ''}{(capital?.netInflow / 10000).toFixed(2)}万
            </div>
          </Col>
          <Col span={12}>
            <div>大单占比</div>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{capital?.largeRatio || 0}%</div>
          </Col>
        </Row>
        <Progress 
          percent={capital?.largeRatio || 0} 
          format={p => `大单 ${p}%`}
          strokeColor="#1890ff"
        />
        <div style={{color:'#666',fontSize:13}}>{capital?.assessment || '暂无资金数据'}</div>
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
                  开始多维度分析 (含相关度)
                </Button>
                
                {result?.thinkingChain && <ThinkingChain steps={result.thinkingChain} />}
                
                {result && (
                  <Collapse ghost>
                    <Panel header="📊 技术指标详情 (含相关度)" key="technical">
                      {result.technical && renderTechnicalIndicators(result.technical)}
                    </Panel>
                  </Collapse>
                )}
                
                {result?.factors && renderAllFactors(result.factors)}
                
                {result?.capital && renderCapital(result.capital)}
                
                {result?.conclusion && (
                  <Card size="small" title="📝 综合结论" style={{ background: result.overallSignal === 'buy' ? '#f6ffed' : result.overallSignal === 'sell' ? '#fff1f0' : '#e6f7ff' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>{result.conclusion}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span>置信度:</span>
                      <Progress 
                        percent={Math.round((result.confidence || 0.7) * 100)} 
                        size="small" 
                        style={{ flex: 1 }}
                      />
                      <span>{Math.round((result.confidence || 0.7) * 100)}%</span>
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
                
                {result?.technical && (
                  <Collapse ghost>
                    <Panel header="📊 技术指标" key="tech">
                      {renderTechnicalIndicators(result.technical)}
                    </Panel>
                  </Collapse>
                )}
                
                {result?.factors && renderAllFactors(result.factors)}
                
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
                            <span style={{ fontWeight: 'bold', fontSize: 16 }}>{p.direction}</span>
                          </div>
                          <Progress percent={Math.round((p.confidence || 0) * 100)} format={() => `${Math.round((p.confidence || 0) * 100)}%`} />
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{p.reason}</div>
                          {p.factors?.length > 0 && (
                            <div style={{marginTop:6}}>
                              {p.factors.map((f: string, j: number) => <Tag key={j} style={{fontSize:10}}>{f}</Tag>)}
                            </div>
                          )}
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

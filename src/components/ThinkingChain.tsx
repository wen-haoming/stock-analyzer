import { Card, Steps } from 'antd'
import { BulbOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'

interface ThinkStep {
  title: string
  content: string
  status: 'pending' | 'thinking' | 'completed'
}

interface ThinkingChainProps {
  steps: ThinkStep[]
}

export default function ThinkingChain({ steps }: ThinkingChainProps) {
  const currentStep = steps.findIndex(s => s.status === 'thinking')
  const completedCount = steps.filter(s => s.status === 'completed').length

  return (
    <Card size="small" title={<>
      <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
      AI 思维链 ({completedCount}/{steps.length})
    </>}>
      <Steps
        current={currentStep >= 0 ? currentStep : steps.length}
        size="small"
        items={steps.map(step => ({
          title: step.title,
          status: step.status === 'completed' ? 'finish' : step.status === 'thinking' ? 'process' : 'wait',
          icon: step.status === 'completed' ? <CheckCircleOutlined /> : step.status === 'thinking' ? <LoadingOutlined /> : null,
        }))}
      />
      {steps.map((step, i) => (
        <div key={i} style={{
          marginTop: 12,
          padding: 12,
          background: step.status === 'thinking' ? '#e6f7ff' : step.status === 'completed' ? '#f6ffed' : '#fafafa',
          borderRadius: 6,
        }}>
          <div style={{ fontWeight: 500 }}>{step.title}</div>
          <div style={{ color: '#666', marginTop: 4, fontSize: 13 }}>{step.content}</div>
        </div>
      ))}
    </Card>
  )
}

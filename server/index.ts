// 导入路由
import './routes/stocks'
import './routes/analysis'

export default defineEventHandler(() => {
  return { message: 'Stock Analyzer API Server' }
})

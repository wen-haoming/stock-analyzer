import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

interface KLineChartProps {
  data: Array<{
    time: string
    open: number
    high: number
    low: number
    close: number
    volume?: number
  }>
  kdj?: Array<{
    time: string
    k: number
    d: number
    j: number
  }>
  height?: number
  showVolume?: boolean
  showKDJ?: boolean
}

export default function KLineChart({ data, kdj, height = 500, showVolume = true, showKDJ = false }: KLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    // 清除旧图表
    containerRef.current.innerHTML = ''

    // 创建图表
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { background: { color: '#fff' }, textColor: '#333' },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      rightPriceScale: { borderColor: '#ddd' },
      timeScale: { borderColor: '#ddd' },
    })

    // K线系列
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#f5222d',
      downColor: '#52c41a',
      borderUpColor: '#f5222d',
      borderDownColor: '#52c41a',
      wickUpColor: '#f5222d',
      wickDownColor: '#52c41a',
    })
    candleSeries.setData(data as any)

    // 成交量系列
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      })
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })
      volumeSeries.setData(data.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? 'rgba(245, 34, 45, 0.5)' : 'rgba(82, 196, 26, 0.5)',
      })))
    }

    // KDJ指标系列
    if (showKDJ && kdj && kdj.length > 0) {
      // 创建KDJ子图表
      chart.addSeries(HistogramSeries, {
        color: '#1890ff',
        priceFormat: { type: 'volume' },
        priceScaleId: 'kdj',
      })
      // 调整主图高度
      // @ts-ignore
      chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.3 } })
    }

    chart.timeScale().fitContent()

    return () => chart.remove()
  }, [data, kdj, height, showVolume, showKDJ])

  return <div ref={containerRef} style={{ width: '100%', height }} />
}

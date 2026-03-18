import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

interface KLineChartProps {
  data: Array<{ time: string; open: number; high: number; low: number; close: number; volume?: number }>
  height?: number
}

export default function KLineChart({ data, height = 400 }: KLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { background: { color: '#fff' }, textColor: '#333' },
    })

    const series = chart.addSeries(CandlestickSeries)
    series.setData(data as any)
    chart.timeScale().fitContent()

    return () => chart.remove()
  }, [data, height])

  return <div ref={containerRef} style={{ width: '100%', height }} />
}

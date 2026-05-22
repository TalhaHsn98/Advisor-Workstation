import React from 'react'

export default function TimeSeriesChart({ values, width = 240, height = 72, stroke = '#60a5fa' }: { values: number[]; width?: number; height?: number; stroke?: string }) {
  if (!values || values.length === 0) return <div />
  const max = Math.max(...values)
  const min = Math.min(...values)
  const len = values.length
  const points = values.map((v, i) => {
    const x = (i / (len - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={stroke} strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

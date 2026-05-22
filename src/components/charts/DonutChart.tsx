import React from 'react'

type Slice = { label: string; value: number; color?: string }

export default function DonutChart({ slices, size = 120, stroke = 18 }: { slices: Slice[]; size?: number; stroke?: number }) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {slices.map((slice, idx) => {
          const portion = slice.value / total
          const dash = portion * circumference
          const element = (
            <circle
              key={idx}
              r={radius}
              cx={0}
              cy={0}
              fill="transparent"
              stroke={slice.color || ['#60a5fa', '#34d399', '#f97316', '#ef4444'][idx % 4]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return element
        })}
        <circle r={radius - stroke - 2} fill="#071127" />
      </g>
    </svg>
  )
}

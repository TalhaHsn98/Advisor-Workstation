import React from 'react'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export default function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
          {subtitle ? <p className="text-slate-400 text-sm mt-1">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  )
}

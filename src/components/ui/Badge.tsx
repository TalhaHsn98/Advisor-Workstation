import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-200',
  success: 'bg-emerald-500/15 text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-300',
  danger: 'bg-rose-500/15 text-rose-300',
  info: 'bg-sky-500/15 text-sky-300'
}

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

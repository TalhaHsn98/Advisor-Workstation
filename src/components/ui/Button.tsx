import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-400 shadow-sm shadow-cyan-500/10',
  secondary: 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700',
  ghost: 'bg-transparent text-slate-100 hover:bg-slate-800'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

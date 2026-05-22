import React, { PropsWithChildren } from 'react'

export default function Card({ children, className = '', ...props }: PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return (
    <section
      className={`rounded-3xl border border-slate-800 bg-[#0f1724] p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

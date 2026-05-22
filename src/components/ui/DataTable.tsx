import React from 'react'

type Column<T> = {
  header: string
  accessor: (row: T) => React.ReactNode
  className?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  emptyText?: string
  className?: string
}

export default function DataTable<T>({ data, columns, emptyText = 'No results found.', className = '' }: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className={`rounded-3xl border border-slate-800 bg-[#0f1724] p-6 text-slate-400 ${className}`}>{emptyText}</div>
  }

  return (
    <div className={`overflow-x-auto rounded-3xl border border-slate-800 bg-[#0f1724] shadow-sm ${className}`}>
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400">
            {columns.map((column) => (
              <th key={column.header} className={`px-4 py-3 ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-800 last:border-0 hover:bg-slate-950/60">
              {columns.map((column) => (
                <td key={column.header} className={`px-4 py-3 ${column.className ?? ''}`}>
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

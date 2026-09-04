import type { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
}

export default function DataTable<T>({ data, columns, keyExtractor }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-[var(--color-nhl-muted)]">No data available</div>;
  }

  return (
    <div className="overflow-x-auto bg-[var(--color-nhl-panel)] border border-[var(--color-nhl-border)] rounded-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-[#222222] text-[var(--color-nhl-muted)] border-b border-[var(--color-nhl-border)]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-6 py-4 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-[var(--color-nhl-border)] hover:bg-[var(--color-nhl-panel-hover)] transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
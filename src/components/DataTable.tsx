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
    return <div className="p-8 text-center text-slate-500 font-medium">No data available</div>;
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-slate-50/80 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 text-slate-700 ${col.className || ''}`}>
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

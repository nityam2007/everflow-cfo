import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    className?: string;
    render: (item: T) => React.ReactNode;
  }[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage = 'No data found.',
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--color-foreground-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-sm text-[var(--color-foreground-muted)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('pb-3 font-medium', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {data.map((item, index) => (
            <tr key={index} className="text-sm">
              {columns.map((col) => (
                <td key={col.key} className={cn('py-4', col.className)}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

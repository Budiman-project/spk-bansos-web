import { Inbox, RefreshCw } from 'lucide-react'
import Spinner from '../atoms/Spinner.jsx'

// Column classes that only make sense in a table cell (width, alignment, no-wrap); dropped in the
// mobile card, where every value sits right-aligned next to its label
const TABLE_ONLY_CLASS = /^(w-|min-w-|max-w-|text-(left|center|right)$|whitespace-)/

function cardClassName(className = '') {
  return className
    .split(/\s+/)
    .filter((c) => c && !TABLE_ONLY_CLASS.test(c))
    .join(' ')
}

// columns = [{ key, header, render?(row), className? }]; without `render` the cell shows row[key].
// Shows loading / error (with retry) / empty states in place of the rows; `footer` is e.g. <Pagination>.
// From `md` up it is a table; on phones each row becomes a card (label: value), with the `aksi` column
// as a row of buttons at the bottom, so nothing hides behind a horizontal scroll.
export default function DataTable({
  columns,
  rows,
  rowKey = 'id',
  loading = false,
  error,
  onRetry,
  emptyMessage = 'Belum ada data',
  footer,
}) {
  const hasRows = rows?.length > 0
  const showRows = hasRows && !error
  const dataColumns = columns.filter((c) => c.key !== 'aksi')
  const actionColumn = columns.find((c) => c.key === 'aksi')

  const state = (
    <TableState
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyMessage={emptyMessage}
    />
  )

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Phones: one card per row */}
      <div className="md:hidden">
        {showRows ? (
          <ul className={`divide-y divide-border ${loading ? 'opacity-60' : ''}`}>
            {rows.map((row) => (
              <li
                key={row[rowKey]}
                className="space-y-2 px-4 py-3"
              >
                {dataColumns.map(({ key, header, render, className }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="shrink-0 pt-0.5 text-xs font-semibold tracking-wide text-fg-muted uppercase">
                      {header}
                    </span>
                    <div className={`flex min-w-0 justify-end text-right break-words ${cardClassName(className)}`}>
                      {render ? render(row) : row[key]}
                    </div>
                  </div>
                ))}
                {actionColumn && (
                  <div className="flex justify-end border-t border-border pt-2">
                    {actionColumn.render ? actionColumn.render(row) : row.aksi}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12">{state}</div>
        )}
      </div>

      {/* Tablet and desktop: the table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-alt text-xs font-semibold tracking-wide text-fg-muted uppercase">
            <tr>
              {columns.map(({ key, header, className = '' }) => (
                <th key={key} scope="col" className={`px-4 py-3 whitespace-nowrap ${className}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-border ${loading && hasRows ? 'opacity-60' : ''}`}>
            {showRows &&
              rows.map((row) => (
                <tr key={row[rowKey]} className="hover:bg-surface-alt/60">
                  {columns.map(({ key, render, className = '' }) => (
                    <td key={key} className={`px-4 py-3 ${className}`}>
                      {render ? render(row) : row[key]}
                    </td>
                  ))}
                </tr>
              ))}

            {!showRows && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  {state}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

function TableState({ loading, error, onRetry, emptyMessage }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-fg-muted" role="status">
        <Spinner className="size-5" />
        Memuat data…
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-danger">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <RefreshCw className="size-4" aria-hidden />
            Coba lagi
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2 text-center text-fg-muted">
      <Inbox className="size-8" aria-hidden />
      {emptyMessage}
    </div>
  )
}

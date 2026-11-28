import PageHeader from '../molecules/PageHeader.jsx'

// Content area of a menu page inside DashboardTemplate: centered column, header, then sections.
// hideHeaderOnPrint: for pages whose content is itself a printable document (Laporan).
export default function PageTemplate({ title, description, actions, hideHeaderOnPrint = false, children }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        className={hideHeaderOnPrint ? 'print:hidden' : ''}
      />
      {children}
    </div>
  )
}

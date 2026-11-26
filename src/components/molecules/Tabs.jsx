// tabs = [{ id, label, icon }]; the parent owns the active id (e.g. in the URL).
// On a narrow screen the tab row scrolls sideways instead of widening the page.
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-1 border-b border-border" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = id === active
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(id)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                selected ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

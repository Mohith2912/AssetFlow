import React from 'react';

export default function Topbar({ title, subtitle, actions = [] }) {
  return (
    <header className="border-b border-slate-200/70 bg-white/70 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            AssetFlow Workspace
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={action.className || 'rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
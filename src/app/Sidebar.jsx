import React from 'react';

export default function Sidebar({
  currentUser,
  navItems,
  activeTab,
  setActiveTab,
  logoutUser,
}) {
  return (
    <aside className="sidebar-glow w-full border-b border-white/10 text-white lg:relative lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
          Enterprise ERP
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          AssetFlow
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Asset & Resource Management System
        </p>
      </div>

      <div className="px-4 py-4">
        <div className="glass-card mb-4 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Session
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {currentUser?.name || 'User'}
          </p>
          <p className="text-xs text-slate-500">
            {currentUser?.role || 'Employee'}
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === item.key
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-6 lg:absolute lg:bottom-0 lg:w-72">
        <button
          onClick={logoutUser}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
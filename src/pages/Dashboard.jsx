import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import AssetDirectory from './AssetDirectory';
import AllocationsPage from './AllocationsPage';
import BookingsPage from './BookingsPage';
import MaintenancePage from './MaintenancePage';
import AuditPage from './AuditPage';
import ReportsPage from './ReportsPage';
import NotificationsPage from './NotificationsPage';
import OrgSetup from './OrgSetup';
import AllocationModal from '../components/modals/AllocationModal';
import BookingModal from '../components/modals/BookingModal';
import MaintenanceModal from '../components/modals/MaintenanceModal';

function StatCard({ title, value, subtitle, tone = 'indigo' }) {
  const toneStyles = {
    indigo: 'kpi-card kpi-indigo',
    emerald: 'kpi-card kpi-emerald',
    amber: 'kpi-card kpi-amber',
    rose: 'kpi-card kpi-rose',
    cyan: 'kpi-card kpi-cyan',
    violet: 'kpi-card kpi-violet',
  };

  return (
    <div className={toneStyles[tone] || toneStyles.indigo}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
        {title}
      </p>
      <h3 className="mt-3 text-3xl font-bold text-white">{value ?? 0}</h3>
      <p className="mt-2 text-sm text-white/80">{subtitle}</p>
    </div>
  );
}

function DashboardOverview({ onOpenAllocation, onOpenBooking, onOpenMaintenance }) {
  const {
    dashboardStats = {},
    transferRequests = [],
    maintenanceRequests = [],
    notifications = [],
    activityLogs = [],
    currentUser,
    organization,
    assets = [],
    setActiveTab,
  } = useMockData();

  const overdueAssets = useMemo(
    () => assets.filter((a) => a.isOverdue && a.status === 'Allocated'),
    [assets]
  );

  const pendingTransfersList = useMemo(
    () => transferRequests.filter((t) => t.status === 'Requested'),
    [transferRequests]
  );

  const pendingMaintenance = useMemo(
    () =>
      maintenanceRequests.filter((m) =>
        ['Pending', 'Approved', 'Technician Assigned', 'In Progress'].includes(m.status)
      ),
    [maintenanceRequests]
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).slice(0, 5),
    [notifications]
  );

  const canAllocate =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Asset Manager' ||
    currentUser?.role === 'Department Head';

  return (
    <div className="space-y-8">
      <div className="hero-dark rounded-[28px] p-6 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              AssetFlow ERP
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Real-time operational overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Monitor asset availability, transfers, resource bookings, maintenance,
              audits, and notifications for{' '}
              <span className="font-semibold text-white">
                {organization?.name || 'your organization'}
              </span>.
            </p>
          </div>

          <div className="glass-card rounded-2xl px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Signed in user
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500">{currentUser?.role || 'Employee'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('directory')}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            Register Asset
          </button>

          {canAllocate ? (
            <button
              onClick={onOpenAllocation}
              className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Allocate Asset
            </button>
          ) : null}

          <button
            onClick={onOpenBooking}
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Book Resource
          </button>

          <button
            onClick={onOpenMaintenance}
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Raise Maintenance Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title="Assets Available"
          value={dashboardStats.assetsAvailable}
          subtitle="Ready for allocation or booking"
          tone="emerald"
        />
        <StatCard
          title="Assets Allocated"
          value={dashboardStats.assetsAllocated}
          subtitle="Currently assigned to users"
          tone="cyan"
        />
        <StatCard
          title="Maintenance Today"
          value={dashboardStats.maintenanceToday}
          subtitle="Open maintenance workflow count"
          tone="amber"
        />
        <StatCard
          title="Active Bookings"
          value={dashboardStats.activeBookings}
          subtitle="Confirmed shared resource slots"
          tone="rose"
        />
        <StatCard
          title="Pending Transfers"
          value={dashboardStats.pendingTransfers}
          subtitle="Awaiting approval and reassignment"
          tone="violet"
        />
        <StatCard
          title="Upcoming Returns"
          value={dashboardStats.upcomingReturns}
          subtitle="Allocated assets due back soon"
          tone="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="premium-card xl:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Overdue returns</h2>
              <p className="mt-1 text-sm text-slate-500">
                Assets that have crossed their expected return date.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                overdueAssets.length > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {dashboardStats.overdueReturns ?? overdueAssets.length} flagged
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {overdueAssets.length > 0 ? (
              overdueAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-rose-900">
                        {asset.name} <span className="text-rose-700">({asset.id})</span>
                      </p>
                      <p className="mt-1 text-sm text-rose-700">
                        Current holder: {asset.currentHolder || 'Unassigned'}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-rose-800">
                      Expected return: {asset.expectedReturnDate || 'Not set'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 text-sm text-emerald-800">
                All active allocations are currently within their expected return windows.
              </div>
            )}
          </div>
        </div>

        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-slate-900">Pending transfers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Requests waiting for manager or department approval.
          </p>

          <div className="mt-5 space-y-3">
            {pendingTransfersList.length > 0 ? (
              pendingTransfersList.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-violet-900">
                        {request.assetName} ({request.assetId})
                      </p>
                      <p className="mt-1 text-sm text-violet-800">
                        {request.fromEmployee} → {request.toEmployee}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-violet-700 shadow-sm">
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No transfer requests are pending approval.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-slate-900">Maintenance queue</h2>
          <p className="mt-1 text-sm text-slate-500">
            Requests pending approval, assignment, or resolution.
          </p>

          <div className="mt-5 space-y-3">
            {pendingMaintenance.length > 0 ? (
              pendingMaintenance.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-amber-900">{request.assetId}</p>
                      <p className="mt-1 text-sm text-amber-800">
                        {request.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700 shadow-sm">
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No active maintenance requests in the queue.
              </div>
            )}
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Unread notifications</h2>
              <p className="mt-1 text-sm text-slate-500">
                Alerts for returns, bookings, transfers, maintenance, and audits.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {unreadNotifications.length} shown
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.type}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.timestamp}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No unread notifications at the moment.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chronological trail of user and system actions.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {activityLogs.length} records
          </span>
        </div>

        <div className="table-wrap mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activityLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-3 pr-4 font-mono text-xs text-slate-500">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3 pr-4 font-semibold text-slate-700">
                    {log.user}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityLogsPage() {
  const { activityLogs = [] } = useMockData();

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-slate-900">Activity Logs</h2>
          <p className="section-subtitle mt-1">
            Full audit trail of operational actions across the system.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {activityLogs.length} entries
        </span>
      </div>

      <div className="table-wrap mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {activityLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 pr-4 font-mono text-xs text-slate-500">
                  {log.timestamp}
                </td>
                <td className="px-4 py-3 pr-4 font-semibold text-slate-700">
                  {log.user}
                </td>
                <td className="px-4 py-3 text-slate-600">{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    logoutUser,
    assets = [],
    employees = [],
    allocateAsset,
    addBooking,
    addMaintenanceRequest,
  } = useMockData();

  const [openAllocation, setOpenAllocation] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openMaintenance, setOpenMaintenance] = useState(false);

  const isAdmin = currentUser?.role === 'Admin';
  const isManager =
    currentUser?.role === 'Asset Manager' ||
    currentUser?.role === 'Department Head';

  const canAccessOrgSetup = isAdmin;

  const navItems = [
    { key: 'dashboard', label: 'Overview', visible: true },
    { key: 'orgSetup', label: 'Organization Setup', visible: canAccessOrgSetup },
    { key: 'directory', label: 'Asset Directory', visible: true },
    { key: 'allocations', label: 'Allocations & Transfers', visible: true },
    { key: 'bookings', label: 'Bookings', visible: true },
    { key: 'maintenance', label: 'Maintenance', visible: true },
    { key: 'audit', label: 'Audit', visible: isAdmin || isManager },
    { key: 'reports', label: 'Reports', visible: isAdmin || isManager },
    { key: 'notifications', label: 'Notifications', visible: true },
    { key: 'activity', label: 'Activity Logs', visible: isAdmin || isManager },
  ].filter((item) => item.visible);

  const renderActivePage = () => {
    if (activeTab === 'orgSetup' && !canAccessOrgSetup) {
      return (
        <div className="premium-card p-6">
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-600">
            Organization Setup is available to Admin users only.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'orgSetup':
        return <OrgSetup />;
      case 'directory':
        return <AssetDirectory />;
      case 'allocations':
        return <AllocationsPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'audit':
        return <AuditPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'activity':
        return <ActivityLogsPage />;
      case 'dashboard':
      default:
        return (
          <DashboardOverview
            onOpenAllocation={() => setOpenAllocation(true)}
            onOpenBooking={() => setOpenBooking(true)}
            onOpenMaintenance={() => setOpenMaintenance(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col lg:flex-row">
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

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{renderActivePage()}</div>
        </main>
      </div>

      <AllocationModal
        isOpen={openAllocation}
        onClose={() => setOpenAllocation(false)}
        assets={assets}
        employees={employees}
        onSubmit={(data) =>
          allocateAsset?.(data.assetId, data.employeeId || data.employeeName, data.expectedReturnDate)
        }
      />

      <BookingModal
        isOpen={openBooking}
        onClose={() => setOpenBooking(false)}
        assets={assets}
        onSubmit={(data) => addBooking?.(data)}
      />

      <MaintenanceModal
        isOpen={openMaintenance}
        onClose={() => setOpenMaintenance(false)}
        assets={assets}
        onSubmit={(data) => addMaintenanceRequest?.(data)}
      />
    </div>
  );
}
import React from 'react';
import { useMockData } from '../context/MockDataContext';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useMockData();

  return (
    <div className="premium-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">
            Alerts for returns, bookings, transfers, maintenance, and audit discrepancies.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {notifications.filter((item) => !item.read).length} unread
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 ${
                item.read
                  ? 'border-slate-200 bg-white'
                  : 'border-indigo-200 bg-indigo-50/60'
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.type}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>{item.audience}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={() => markNotificationRead(item.id)}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
}
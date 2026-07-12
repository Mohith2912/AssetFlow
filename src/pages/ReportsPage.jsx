import React from 'react';
import { useMockData } from '../context/MockDataContext';

function ReportCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function ReportsPage() {
  const { reportData } = useMockData();

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">
          Operational insights across asset utilization, maintenance, departments, and bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard title="Total Assets" value={reportData.totalAssets} subtitle="All registered assets" />
        <ReportCard title="Idle Assets" value={reportData.idleAssets} subtitle="Currently available and unused" />
        <ReportCard title="Utilized Assets" value={reportData.utilizedAssets} subtitle="Actively allocated assets" />
        <ReportCard
          title="Bookable Resources"
          value={reportData.bookingUsage.length}
          subtitle="Resources enabled for shared booking"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Maintenance by category</h3>
          <div className="mt-5 space-y-3">
            {reportData.maintenanceByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">{item.category}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Department allocation summary</h3>
          <div className="mt-5 space-y-3">
            {reportData.allocationByDepartment.map((item) => (
              <div key={item.department} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-700">{item.department}</span>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-lg font-bold text-slate-900">Resource booking usage</h3>
        <div className="table-wrap mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Confirmed Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reportData.bookingUsage.map((item) => (
                <tr key={item.resource}>
                  <td className="px-4 py-3 font-medium text-slate-700">{item.resource}</td>
                  <td className="px-4 py-3 text-slate-600">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
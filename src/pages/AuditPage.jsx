import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function AuditPage() {
  const {
    auditCycles = [],
    employees = [],
    createAuditCycle,
    markAuditItem,
    closeAuditCycle,
    currentUser,
  } = useMockData();

  const [form, setForm] = useState({
    name: '',
    scope: '',
    auditor: '',
    startDate: '',
    endDate: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const auditors = useMemo(
    () =>
      employees.filter(
        (emp) =>
          emp.status !== 'Inactive' &&
          ['Admin', 'Asset Manager', 'Department Head'].includes(emp.role)
      ),
    [employees]
  );

  const handleCreate = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!form.name || !form.scope || !form.auditor || !form.startDate || !form.endDate) {
      setFeedback({
        type: 'error',
        message: 'Please complete all audit cycle fields.',
      });
      return;
    }

    if (form.endDate < form.startDate) {
      setFeedback({
        type: 'error',
        message: 'End date cannot be earlier than start date.',
      });
      return;
    }

    const result = createAuditCycle(form);

    if (!result?.ok) {
      setFeedback({
        type: 'error',
        message: result?.message || 'Unable to create audit cycle.',
      });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Audit cycle ${form.name} created successfully.`,
    });

    setForm({
      name: '',
      scope: '',
      auditor: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleMark = (cycleId, assetId, status) => {
    const result = markAuditItem(cycleId, assetId, status);

    if (!result?.ok) {
      setFeedback({
        type: 'error',
        message: result?.message || 'Unable to update audit item.',
      });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Asset ${assetId} marked as ${status}.`,
    });
  };

  const handleClose = (cycleId) => {
    const result = closeAuditCycle(cycleId);

    if (!result?.ok) {
      setFeedback({
        type: 'error',
        message: result?.message || 'Unable to close audit cycle.',
      });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Audit cycle ${cycleId} closed successfully.`,
    });
  };

  const getCounts = (items = []) => ({
    verified: items.filter((item) => item.verificationStatus === 'Verified').length,
    missing: items.filter((item) => item.verificationStatus === 'Missing').length,
    damaged: items.filter((item) => item.verificationStatus === 'Damaged').length,
  });

  const canManageAudit =
    currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <h2 className="text-xl font-bold text-slate-900">Asset Audit</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create audit cycles, assign auditors, verify assets, and lock discrepancy results.
        </p>

        {feedback.message ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {canManageAudit && (
          <form
            onSubmit={handleCreate}
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Audit cycle name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Scope / location / department"
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
            />
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.auditor}
              onChange={(e) => setForm({ ...form, auditor: e.target.value })}
            >
              <option value="">Select auditor</option>
              {auditors.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} - {emp.role}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <input
              type="date"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Create Audit Cycle
            </button>
          </form>
        )}
      </div>

      {auditCycles.map((cycle) => {
        const counts = getCounts(cycle.items);

        return (
          <div key={cycle.id} className="premium-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{cycle.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Scope: {cycle.scope} · Auditor: {cycle.auditor}
                </p>
                <p className="text-xs text-slate-400">
                  {cycle.startDate} to {cycle.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    cycle.status === 'Closed'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {cycle.status}
                </span>
                {cycle.status !== 'Closed' && canManageAudit && (
                  <button
                    onClick={() => handleClose(cycle.id)}
                    className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Close Cycle
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase text-emerald-700">Verified</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{counts.verified}</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-xs font-bold uppercase text-rose-700">Missing</p>
                <p className="mt-2 text-2xl font-bold text-rose-900">{counts.missing}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase text-amber-700">Damaged</p>
                <p className="mt-2 text-2xl font-bold text-amber-900">{counts.damaged}</p>
              </div>
            </div>

            <div className="table-wrap mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Asset ID</th>
                    <th className="px-4 py-3">Asset Name</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cycle.items.map((item) => (
                    <tr key={item.assetId}>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.assetId}</td>
                      <td className="px-4 py-3 text-slate-600">{item.assetName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {cycle.status === 'Open' && canManageAudit ? (
                          <div className="flex flex-wrap gap-2">
                            {['Verified', 'Missing', 'Damaged'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleMark(cycle.id, item.assetId, status)}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {cycle.status === 'Closed' ? 'Locked' : 'View only'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
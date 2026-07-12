import React, { useState } from 'react';
import BaseModal from './BaseModal';

export default function MaintenanceModal({
  isOpen,
  onClose,
  assets = [],
  onSubmit,
}) {
  const [form, setForm] = useState({
    assetId: '',
    issueDescription: '',
    priority: 'Medium',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.assetId || !form.issueDescription.trim()) {
      setError('Please select an asset and describe the issue.');
      return;
    }

    setError('');
    onSubmit?.(form);
    setForm({
      assetId: '',
      issueDescription: '',
      priority: 'Medium',
    });
    onClose?.();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Raise Maintenance Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Asset</label>
          <select
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Choose asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.id} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Issue description
          </label>
          <textarea
            rows="4"
            value={form.issueDescription}
            onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
            placeholder="Describe the issue"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Submit Request
        </button>
      </form>
    </BaseModal>
  );
}
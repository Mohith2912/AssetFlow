import React, { useState } from 'react';
import BaseModal from './BaseModal';

export default function AllocationModal({
  isOpen,
  onClose,
  assets = [],
  employees = [],
  onSubmit,
}) {
  const [form, setForm] = useState({
    assetId: '',
    employeeId: '',
    expectedReturnDate: '',
  });

  const [error, setError] = useState('');

  const allocatableAssets = assets.filter((asset) => asset.status === 'Available');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.assetId || !form.employeeId) {
      setError('Please select asset and employee.');
      return;
    }

    setError('');
    onSubmit?.(form);
    setForm({
      assetId: '',
      employeeId: '',
      expectedReturnDate: '',
    });
    onClose?.();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Allocate Asset">
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
            {allocatableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.id} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Employee</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Choose employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Expected return date
          </label>
          <input
            type="date"
            value={form.expectedReturnDate}
            onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Confirm Allocation
        </button>
      </form>
    </BaseModal>
  );
}
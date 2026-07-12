import React, { useState } from 'react';
import BaseModal from './BaseModal';

export default function BookingModal({
  isOpen,
  onClose,
  assets = [],
  onSubmit,
}) {
  const [form, setForm] = useState({
    assetId: '',
    purpose: '',
    startTime: '',
    endTime: '',
  });

  const [error, setError] = useState('');

  const bookableAssets = assets.filter((asset) => asset.isBookable);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.assetId || !form.startTime || !form.endTime) {
      setError('Please fill all required booking fields.');
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('End time must be after start time.');
      return;
    }

    setError('');
    onSubmit?.(form);
    setForm({
      assetId: '',
      purpose: '',
      startTime: '',
      endTime: '',
    });
    onClose?.();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Book Resource">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Resource</label>
          <select
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Choose bookable asset</option>
            {bookableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.id} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Purpose</label>
          <input
            type="text"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="Enter booking purpose"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Start time</label>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">End time</label>
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
        >
          Confirm Booking
        </button>
      </form>
    </BaseModal>
  );
}
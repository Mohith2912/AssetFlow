import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function AssetDirectory() {
  const {
    assets,
    categories,
    departments,
    currentUser,
    addAsset,
    allocations,
    maintenanceRequests,
  } = useMockData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedBookable, setSelectedBookable] = useState('All');

  const [form, setForm] = useState({
    name: '',
    category: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'Good',
    location: '',
    department: '',
    isBookable: false,
    notes: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const canManageInventory =
    currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  const handleAddAsset = (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.location) {
      setFeedback({
        type: 'error',
        message: 'Asset name, category, and location are required.',
      });
      return;
    }

    const result = addAsset(form);

    if (result?.ok) {
      setFeedback({
        type: 'success',
        message: `Asset ${result.asset.id} registered successfully.`,
      });
      setForm({
        name: '',
        category: '',
        serialNumber: '',
        acquisitionDate: '',
        acquisitionCost: '',
        condition: 'Good',
        location: '',
        department: '',
        isBookable: false,
        notes: '',
      });
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Unable to register asset.',
      });
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        asset.name?.toLowerCase().includes(term) ||
        asset.id?.toLowerCase().includes(term) ||
        asset.serialNumber?.toLowerCase().includes(term) ||
        asset.location?.toLowerCase().includes(term) ||
        asset.department?.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === 'All' || asset.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || asset.status === selectedStatus;

      const matchesDepartment =
        selectedDepartment === 'All' || asset.department === selectedDepartment;

      const matchesBookable =
        selectedBookable === 'All' ||
        (selectedBookable === 'Bookable' && asset.isBookable) ||
        (selectedBookable === 'Non-Bookable' && !asset.isBookable);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDepartment &&
        matchesBookable
      );
    });
  }, [
    assets,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedDepartment,
    selectedBookable,
  ]);

  const getAssetHistory = (assetId) => {
    const allocationCount = allocations.filter((item) => item.assetId === assetId).length;
    const maintenanceCount = maintenanceRequests.filter((item) => item.assetId === assetId).length;

    return {
      allocationCount,
      maintenanceCount,
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700';
      case 'Allocated':
        return 'bg-indigo-50 text-indigo-700';
      case 'Reserved':
        return 'bg-cyan-50 text-cyan-700';
      case 'Under Maintenance':
        return 'bg-amber-50 text-amber-700';
      case 'Lost':
        return 'bg-rose-50 text-rose-700';
      case 'Retired':
        return 'bg-slate-200 text-slate-700';
      case 'Disposed':
        return 'bg-slate-300 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">Asset Directory</h2>
        <p className="mt-1 text-sm text-gray-500">
          Register, search, and monitor assets across lifecycle states, departments,
          locations, and usage patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-4">
        {canManageInventory ? (
          <div className="premium-card space-y-4 p-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Asset</h3>
              <p className="mt-1 text-xs text-slate-500">
                Add a tracked asset with lifecycle metadata and booking eligibility.
              </p>
            </div>

            {feedback.message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {feedback.message}
              </div>
            ) : null}

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Dell UltraSharp 27"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  required
                >
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  placeholder="e.g., SN-LT-9001"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  value={form.acquisitionDate}
                  onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Acquisition Cost
                </label>
                <input
                  type="number"
                  value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                  placeholder="e.g., 85000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Condition
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">Choose department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Floor 3 / Lab 2"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isBookable}
                  onChange={(e) => setForm({ ...form, isBookable: e.target.checked })}
                />
                Mark this asset as shared / bookable
              </label>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional asset notes"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Register Asset
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-xs font-medium text-slate-500">
              Your account has read-only access to the asset registry.
            </p>
          </div>
        )}

        <div className="space-y-6 xl:col-span-3">
          <div className="premium-card grid grid-cols-1 gap-4 p-4 md:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, tag, serial, department, location"
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              >
                <option value="All">All Status Types</option>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Lost">Lost</option>
                <option value="Retired">Retired</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Booking Flag
              </label>
              <select
                value={selectedBookable}
                onChange={(e) => setSelectedBookable(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              >
                <option value="All">All Assets</option>
                <option value="Bookable">Bookable</option>
                <option value="Non-Bookable">Non-Bookable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => {
                const history = getAssetHistory(asset.id);

                return (
                  <div
                    key={asset.id}
                    className="premium-card flex flex-col justify-between p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                            {asset.id}
                          </span>
                          <p className="mt-1.5 text-xs font-medium text-slate-400">
                            {asset.category}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>
                      </div>

                      <h4 className="mt-3 text-base font-bold text-slate-800">
                        {asset.name}
                      </h4>

                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        <p>
                          Serial Number:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.serialNumber || 'Not provided'}
                          </span>
                        </p>
                        <p>
                          Department:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.department || 'Not assigned'}
                          </span>
                        </p>
                        <p>
                          Location:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.location}
                          </span>
                        </p>
                        <p>
                          Condition:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.condition || 'Good'}
                          </span>
                        </p>
                        <p>
                          Bookable:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.isBookable ? 'Yes' : 'No'}
                          </span>
                        </p>
                        <p>
                          Acquisition Date:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.acquisitionDate || 'Not provided'}
                          </span>
                        </p>
                        <p>
                          Acquisition Cost:{' '}
                          <span className="font-semibold text-slate-700">
                            {asset.acquisitionCost || 'Not provided'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                      {asset.status === 'Allocated' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">Current Holder</span>
                          <span
                            className={`font-semibold ${
                              asset.isOverdue ? 'text-rose-600' : 'text-slate-700'
                            }`}
                          >
                            {asset.currentHolder || 'Unassigned'}{' '}
                            {asset.isOverdue ? '(OVERDUE)' : ''}
                          </span>
                        </div>
                      )}

                      {asset.expectedReturnDate ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-400">Expected Return</span>
                          <span className="font-semibold text-slate-700">
                            {asset.expectedReturnDate}
                          </span>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-slate-400">Allocation History</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {history.allocationCount}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2">
                          <p className="text-slate-400">Maintenance History</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {history.maintenanceCount}
                          </p>
                        </div>
                      </div>

                      {asset.notes ? (
                        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Notes:</span> {asset.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2 rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <p className="text-sm font-medium text-slate-400">
                  No assets match the current search and filter combination.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
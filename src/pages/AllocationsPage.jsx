import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function AllocationsPage() {
  const {
    assets,
    employees,
    allocations,
    transferRequests,
    allocateAsset,
    requestTransfer,
    approveTransfer,
    returnAsset,
  } = useMockData();

  const [allocationForm, setAllocationForm] = useState({
    assetId: '',
    employeeName: '',
    expectedReturnDate: '',
  });

  const [transferForm, setTransferForm] = useState({
    assetId: '',
    toEmployee: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === 'Active'),
    [employees]
  );

  const allocatableAssets = useMemo(
    () => assets.filter((asset) => asset.status === 'Available'),
    [assets]
  );

  const allocatedAssets = useMemo(
    () => assets.filter((asset) => asset.status === 'Allocated'),
    [assets]
  );

  const activeAllocations = useMemo(
    () => allocations.filter((item) => item.status === 'Active'),
    [allocations]
  );

  const pendingTransfers = useMemo(
    () => transferRequests.filter((item) => item.status === 'Requested'),
    [transferRequests]
  );

  const selectedTransferAsset = useMemo(
    () => allocatedAssets.find((asset) => asset.id === transferForm.assetId),
    [allocatedAssets, transferForm.assetId]
  );

  const handleAllocate = (e) => {
    e.preventDefault();

    if (!allocationForm.assetId || !allocationForm.employeeName) {
      setFeedback({
        type: 'error',
        message: 'Please select an asset and employee before allocating.',
      });
      return;
    }

    const selectedEmployee = activeEmployees.find(
      (employee) => employee.name === allocationForm.employeeName
    );

    if (!selectedEmployee) {
      setFeedback({
        type: 'error',
        message: 'Only active employees can receive assets.',
      });
      return;
    }

    const result = allocateAsset(
      allocationForm.assetId,
      allocationForm.employeeName,
      allocationForm.expectedReturnDate
    );

    if (result?.ok || result?.allowed) {
      setFeedback({
        type: 'success',
        message: `Asset ${allocationForm.assetId} allocated to ${allocationForm.employeeName}.`,
      });
      setAllocationForm({
        assetId: '',
        employeeName: '',
        expectedReturnDate: '',
      });
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Allocation failed.',
      });

      if (result?.holder) {
        setTransferForm({
          assetId: allocationForm.assetId,
          toEmployee: '',
        });
      }
    }
  };

  const handleTransferRequest = (e) => {
    e.preventDefault();

    if (!transferForm.assetId || !transferForm.toEmployee) {
      setFeedback({
        type: 'error',
        message: 'Please select an allocated asset and target employee.',
      });
      return;
    }

    if (selectedTransferAsset?.currentHolder === transferForm.toEmployee) {
      setFeedback({
        type: 'error',
        message: 'Selected employee already holds this asset.',
      });
      return;
    }

    const selectedEmployee = activeEmployees.find(
      (employee) => employee.name === transferForm.toEmployee
    );

    if (!selectedEmployee) {
      setFeedback({
        type: 'error',
        message: 'Transfers can only be requested for active employees.',
      });
      return;
    }

    const result = requestTransfer(transferForm.assetId, transferForm.toEmployee);

    if (result?.ok) {
      setFeedback({
        type: 'success',
        message: `Transfer requested for ${transferForm.assetId} to ${transferForm.toEmployee}.`,
      });
      setTransferForm({
        assetId: '',
        toEmployee: '',
      });
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Transfer request failed.',
      });
    }
  };

  const handleApproveTransfer = (transferId) => {
    const result = approveTransfer(transferId);

    if (result?.ok) {
      setFeedback({
        type: 'success',
        message: `Transfer ${transferId} approved successfully.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Unable to approve transfer.',
      });
    }
  };

  const handleReturnAsset = (assetId) => {
    const result = returnAsset(assetId);

    if (result?.ok) {
      setFeedback({
        type: 'success',
        message: `Asset ${assetId} returned successfully.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: result?.message || 'Return flow failed.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <h2 className="text-xl font-bold text-slate-900">Asset Allocations & Transfers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Allocate assets, prevent duplicate custody, process transfers, and complete returns.
        </p>

        {feedback.message ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Allocate asset</h3>
          <p className="mt-1 text-sm text-slate-500">
            Only assets with Available status can be assigned.
          </p>

          <form onSubmit={handleAllocate} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select asset
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={allocationForm.assetId}
                onChange={(e) =>
                  setAllocationForm({ ...allocationForm, assetId: e.target.value })
                }
              >
                <option value="">Choose available asset</option>
                {allocatableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Assign to employee
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={allocationForm.employeeName}
                onChange={(e) =>
                  setAllocationForm({ ...allocationForm, employeeName: e.target.value })
                }
              >
                <option value="">Choose active employee</option>
                {activeEmployees.map((employee) => (
                  <option key={employee.id} value={employee.name}>
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={allocationForm.expectedReturnDate}
                onChange={(e) =>
                  setAllocationForm({
                    ...allocationForm,
                    expectedReturnDate: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Allocate Asset
            </button>
          </form>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Raise transfer request</h3>
          <p className="mt-1 text-sm text-slate-500">
            Use this when an asset is already allocated and needs reassignment.
          </p>

          <form onSubmit={handleTransferRequest} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Allocated asset
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={transferForm.assetId}
                onChange={(e) =>
                  setTransferForm({
                    assetId: e.target.value,
                    toEmployee: '',
                  })
                }
              >
                <option value="">Choose allocated asset</option>
                {allocatedAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - {asset.name} ({asset.currentHolder})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Transfer to
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={transferForm.toEmployee}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, toEmployee: e.target.value })
                }
              >
                <option value="">Choose target employee</option>
                {activeEmployees
                  .filter((employee) => employee.name !== selectedTransferAsset?.currentHolder)
                  .map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name} - {employee.role}
                    </option>
                  ))}
              </select>
            </div>

            {selectedTransferAsset ? (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                Current holder: <span className="font-semibold">{selectedTransferAsset.currentHolder}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Request Transfer
            </button>
          </form>
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pending transfer approvals</h3>
            <p className="mt-1 text-sm text-slate-500">
              Requested transfers waiting for approval and re-allocation.
            </p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            {pendingTransfers.length} pending
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {pendingTransfers.length > 0 ? (
            pendingTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-violet-900">
                      {transfer.assetName} ({transfer.assetId})
                    </p>
                    <p className="mt-1 text-sm text-violet-700">
                      {transfer.fromEmployee} → {transfer.toEmployee}
                    </p>
                    <p className="mt-1 text-xs text-violet-500">
                      Requested by {transfer.requestedBy} on {transfer.requestedDate}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApproveTransfer(transfer.id)}
                    className="rounded-2xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Approve Transfer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No transfer approvals are currently pending.
            </div>
          )}
        </div>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Active allocations</h3>
            <p className="mt-1 text-sm text-slate-500">
              Live custody records with return handling.
            </p>
          </div>
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
            {activeAllocations.length} active
          </span>
        </div>

        <div className="table-wrap mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Assigned By</th>
                <th className="px-4 py-3">Return Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeAllocations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{item.assetName}</p>
                    <p className="text-xs text-slate-500">{item.assetId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.assignedTo}</td>
                  <td className="px-4 py-3 text-slate-600">{item.assignedBy}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.expectedReturnDate || 'Not set'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleReturnAsset(item.assetId)}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Mark Returned
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
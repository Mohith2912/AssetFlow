import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function MaintenancePage() {
  const {
    assets = [],
    maintenanceRequests = [],
    raiseMaintenance,
    currentUser,
    updateMaintenanceStatus,
    employees = [],
  } = useMockData();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [technicianSelections, setTechnicianSelections] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canApproveMaintenance =
    currentUser?.role === 'Admin' || currentUser?.role === 'Asset Manager';

  const maintenanceEligibleAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.status !== 'Retired' &&
          asset.status !== 'Disposed' &&
          asset.status !== 'Lost'
      ),
    [assets]
  );

  const technicians = useMemo(() => {
    return (
      employees.filter(
        (emp) =>
          emp.role === 'Asset Manager' ||
          emp.role === 'Technician' ||
          emp.department === 'IT' ||
          emp.department === 'Facilities'
      ) || []
    );
  }, [employees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedAssetId || !description.trim()) {
      setErrorMessage('Please select an asset and enter the issue description.');
      return;
    }

    if (description.trim().length < 8) {
      setErrorMessage('Issue description should be at least 8 characters long.');
      return;
    }

    const result = raiseMaintenance(selectedAssetId, description.trim(), priority);

    if (!result?.ok) {
      setErrorMessage(result?.message || 'Unable to raise maintenance request.');
      return;
    }

    setSuccessMessage(`Maintenance request created successfully for ${selectedAssetId}.`);
    setDescription('');
    setSelectedAssetId('');
    setPriority('Medium');
  };

  const handleStatusChange = (requestId, nextStatus, assignedTechnician = '') => {
    setSuccessMessage('');
    setErrorMessage('');

    if (nextStatus === 'Technician Assigned' && !assignedTechnician) {
      setErrorMessage('Please select a technician before assignment.');
      return;
    }

    const result = updateMaintenanceStatus(requestId, nextStatus, assignedTechnician);

    if (!result?.ok) {
      setErrorMessage(result?.message || 'Unable to update maintenance status.');
      return;
    }

    setSuccessMessage(`Maintenance request updated to ${nextStatus}.`);

    if (nextStatus === 'Technician Assigned') {
      setTechnicianSelections((prev) => ({
        ...prev,
        [requestId]: '',
      }));
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700';
      case 'Technician Assigned':
        return 'bg-violet-100 text-violet-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Approved':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">
          Maintenance Management
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Raise repair requests, manage approval workflow, assign technicians, and track service resolution.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
        <div className="premium-card space-y-5 p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Raise Maintenance Request</h3>
            <p className="mt-1 text-xs text-slate-500">
              Submit an issue against an asset and route it into the maintenance approval queue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Select Asset
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
                required
              >
                <option value="">Select asset</option>
                {maintenanceEligibleAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - {asset.name} ({asset.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Issue Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, damage, or malfunction"
                className="h-28 w-full rounded-lg border border-slate-200 p-2.5 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Submit Request
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Workflow rule
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Requests should move from Pending to Approved or Rejected, then to Technician Assigned,
              In Progress, and finally Resolved, with the asset status changing during the workflow.
            </p>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Maintenance Request Ledger
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  View submitted requests, current stage, technician assignment, and resolution progress.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {maintenanceRequests.length} requests
              </span>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3">Issue</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Technician</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {maintenanceRequests.length > 0 ? (
                    maintenanceRequests.map((request) => (
                      <tr key={request.id} className="align-top hover:bg-slate-50/40">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-800">{request.assetId}</p>
                          <p className="text-xs text-slate-400">{request.id}</p>
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-700">
                          {request.description}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${getPriorityBadge(
                              request.priority
                            )}`}
                          >
                            {request.priority}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-600">
                          {request.technician || 'Not assigned'}
                        </td>

                        <td className="py-4 text-right">
                          {canApproveMaintenance ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              {request.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(request.id, 'Approved')}
                                    className="rounded bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(request.id, 'Rejected')}
                                    className="rounded bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {request.status === 'Approved' && (
                                <div className="flex flex-wrap justify-end gap-2">
                                  <select
                                    value={technicianSelections[request.id] || ''}
                                    onChange={(e) =>
                                      setTechnicianSelections((prev) => ({
                                        ...prev,
                                        [request.id]: e.target.value,
                                      }))
                                    }
                                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px]"
                                  >
                                    <option value="">Assign technician</option>
                                    {technicians.map((emp) => (
                                      <option key={emp.id} value={emp.name}>
                                        {emp.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        request.id,
                                        'Technician Assigned',
                                        technicianSelections[request.id] || ''
                                      )
                                    }
                                    className="rounded bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-100"
                                  >
                                    Assign
                                  </button>
                                </div>
                              )}

                              {request.status === 'Technician Assigned' && (
                                <button
                                  onClick={() => handleStatusChange(request.id, 'In Progress')}
                                  className="rounded bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                                >
                                  Start Work
                                </button>
                              )}

                              {request.status === 'In Progress' && (
                                <button
                                  onClick={() => handleStatusChange(request.id, 'Resolved')}
                                  className="rounded bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Resolve
                                </button>
                              )}

                              {['Resolved', 'Rejected'].includes(request.status) && (
                                <span className="text-[11px] italic text-slate-400">
                                  Closed
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">
                              View only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sm italic text-slate-400">
                        No maintenance requests have been raised yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="mb-4 text-base font-bold text-slate-900">Service Snapshot</h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Pending
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-900">
                  {maintenanceRequests.filter((m) => m.status === 'Pending').length}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Approved
                </p>
                <p className="mt-2 text-2xl font-bold text-cyan-900">
                  {maintenanceRequests.filter((m) => m.status === 'Approved').length}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Active Work
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {
                    maintenanceRequests.filter(
                      (m) =>
                        m.status === 'Technician Assigned' || m.status === 'In Progress'
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Resolved
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">
                  {maintenanceRequests.filter((m) => m.status === 'Resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
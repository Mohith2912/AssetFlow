import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { api, setAuthToken, clearAuthToken } from '../api/client';

const MockDataContext = createContext(null);

const normalizeAsset = (item) => {
  const status = String(item?.status || item?.lifecycle_status || 'Available');
  const normalizedStatus = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return {
    id: item?.asset_code || item?.id || 'AF-0000',
    apiId: item?.id ?? null,
    name: item?.name || item?.asset_name || '',
    category: item?.category || item?.category_name || '',
    status: normalizedStatus,
    currentHolder: item?.currentHolder || null,
    location: item?.location || '',
    department: item?.department || item?.department_name || '',
    condition: item?.condition || item?.condition_status || 'Good',
    acquisitionDate: item?.acquisitionDate || item?.acquisition_date || '',
    acquisitionCost: item?.acquisitionCost || item?.acquisition_cost || '',
    notes: item?.notes || '',
    serialNumber: item?.serialNumber || item?.serial_number || '',
    isBookable: Boolean(item?.isBookable ?? item?.is_bookable ?? false),
    expectedReturnDate: item?.expectedReturnDate || '',
    raw: item,
  };
};

const normalizeEmployee = (item) => ({
  id: item?.id ?? Date.now(),
  apiId: item?.id ?? null,
  name: item?.name || item?.full_name || '',
  email: item?.email || '',
  departmentId: item?.department_id ?? item?.departmentId ?? 1,
  role: item?.role || 'Employee',
  status: item?.status || 'Active',
  department: item?.department || '',
  raw: item,
});

const normalizeAuthUser = (item, fallbackEmail = '', fallbackRole = 'Employee') => ({
  id: item?.id ?? Date.now(),
  apiId: item?.id ?? null,
  name: item?.name || item?.full_name || fallbackEmail.split('@')[0] || 'User',
  email: item?.email || fallbackEmail,
  role: item?.role || fallbackRole,
  departmentId: item?.department_id ?? item?.departmentId ?? 1,
  status: item?.status || 'Active',
  raw: item,
});

const normalizeAllocation = (item) => ({
  id: item?.id ? `ALC-${item.id}` : `ALC-${Date.now()}`,
  apiId: item?.id ?? null,
  assetId: item?.asset_code || item?.assetId || item?.asset_id,
  assetName: item?.asset_name || '',
  assignedTo: item?.user_name || item?.assignedTo || '',
  assignedBy: item?.assigned_by || item?.assignedBy || '',
  date: item?.allocation_date || item?.date || '',
  expectedReturnDate: item?.expected_return_date || item?.expectedReturnDate || '',
  status: item?.status || item?.allocation_status || 'Active',
  raw: item,
});

const normalizeTransfer = (item) => ({
  id: item?.id ? `TRF-${item.id}` : `TRF-${Date.now()}`,
  apiId: item?.id ?? null,
  assetId: item?.asset_code || item?.assetId || item?.asset_id,
  assetName: item?.asset_name || '',
  fromEmployee: item?.fromEmployee || item?.current_holder || '',
  toEmployee: item?.toEmployee || item?.target_user || '',
  requestedBy: item?.requestedBy || item?.requester || '',
  status: item?.status || item?.request_status || 'Requested',
  requestedDate: item?.requestedDate || item?.requested_at || '',
  raw: item,
});

const normalizeBooking = (item) => ({
  id: item?.id ? `BK-${item.id}` : `BK-${Date.now()}`,
  apiId: item?.id ?? null,
  resourceId: item?.asset_code || item?.resourceId || item?.asset_id,
  resourceName: item?.asset_name || item?.resourceName || '',
  user: item?.user_name || item?.user || item?.booked_by_user_id,
  date: item?.date || (item?.start_time ? item.start_time.split('T')[0] : ''),
  startTime: item?.start_time ? item.start_time.split('T')[1]?.slice(0, 5) : item?.startTime || '',
  endTime: item?.end_time ? item.end_time.split('T')[1]?.slice(0, 5) : item?.endTime || '',
  status: item?.status || item?.booking_status || 'Confirmed',
  raw: item,
});

const normalizeMaintenance = (item) => ({
  id: item?.id ? `MNT-${item.id}` : `MNT-${Date.now()}`,
  apiId: item?.id ?? null,
  assetId: item?.asset_code || item?.assetId || item?.asset_id,
  description: item?.description || item?.reason || item?.issue_description || '',
  priority: item?.priority || 'Medium',
  status: item?.status || item?.maintenance_status || 'Pending',
  requestedBy: item?.requested_by_name || item?.requestedBy || '',
  technician: item?.technician || item?.technician_name || '',
  raw: item,
});

const normalizeNotification = (item) => ({
  id: item?.id ? `NTF-${item.id}` : `NTF-${Date.now()}`,
  apiId: item?.id ?? null,
  type: item?.type || item?.notification_type || item?.title || 'Notification',
  message: item?.message || '',
  audience: item?.audience || 'User',
  timestamp: item?.timestamp || item?.createdAt || '',
  read: Boolean(item?.read ?? item?.isRead ?? false),
  raw: item,
});

const normalizeActivityLog = (item) => ({
  id: item?.id ?? Date.now(),
  user: item?.user_name || item?.user || 'System',
  action: item?.action || item?.description || item?.action_type || '',
  timestamp: item?.timestamp || item?.createdAt || '',
  raw: item,
});

export const MockDataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [organization, setOrganization] = useState({
    name: 'AssetFlow Demo Workspace',
  });

  const [departments, setDepartments] = useState([]);

  const [categories, setCategories] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [assets, setAssets] = useState([]);

  const [allocations, setAllocations] = useState([]);

  const [transferRequests, setTransferRequests] = useState([]);

  const [bookings, setBookings] = useState([]);

  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  const [auditCycles, setAuditCycles] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [apiDashboardMetrics, setApiDashboardMetrics] = useState(null);
  const [apiReportMetrics, setApiReportMetrics] = useState(null);

  const [activityLogs, setActivityLogs] = useState([]);

  const createTimestamp = () =>
    new Date().toISOString().replace('T', ' ').substring(0, 19);

  const todayString = () => new Date().toISOString().split('T')[0];

  const isAssetOverdue = (asset) =>
    asset.status === 'Allocated' &&
    !!asset.expectedReturnDate &&
    asset.expectedReturnDate < todayString();

  const addActivityLog = (action, user = currentUser?.name || 'System') => {
    setActivityLogs((prev) => [
      {
        id: Date.now(),
        user,
        action,
        timestamp: createTimestamp(),
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [assetsResponse, departmentsResponse, employeesResponse, allocationsResponse, bookingsResponse, maintenanceResponse, notificationsResponse, activityLogsResponse, dashboardResponse, reportResponse] = await Promise.all([
          api.get('/assets').catch(() => null),
          api.get('/departments').catch(() => null),
          api.get('/employees').catch(() => null),
          api.get('/allocations/transfers').catch(() => null),
          api.get('/bookings').catch(() => null),
          api.get('/maintenance').catch(() => null),
          api.get('/notifications').catch(() => null),
          api.get('/activity-logs').catch(() => null),
          api.get('/dashboard/stats').catch(() => null),
          api.get('/reports/analytics').catch(() => null),
        ]);

        if (assetsResponse?.data) {
          const nextAssets = Array.isArray(assetsResponse.data) ? assetsResponse.data : [];
          setAssets(nextAssets.map(normalizeAsset));
        }

        if (departmentsResponse?.data) {
          const nextDepartments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
          setDepartments(nextDepartments.map((item) => ({
            id: item.id,
            name: item.name || item.department_name,
            head: item.head || '',
            parentDepartment: item.parentDepartment || '',
            status: item.status || 'Active',
            raw: item,
          })));
        }

        if (employeesResponse?.data) {
          const nextEmployees = Array.isArray(employeesResponse.data) ? employeesResponse.data : [];
          setEmployees(nextEmployees.map(normalizeEmployee));
        }

        if (allocationsResponse?.data) {
          setTransferRequests((Array.isArray(allocationsResponse.data) ? allocationsResponse.data : []).map(normalizeTransfer));
        }

        if (bookingsResponse?.data) {
          const nextBookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
          setBookings(nextBookings.map(normalizeBooking));
        }

        if (maintenanceResponse?.data) {
          const nextMaintenance = Array.isArray(maintenanceResponse.data) ? maintenanceResponse.data : [];
          setMaintenanceRequests(nextMaintenance.map(normalizeMaintenance));
        }

        if (notificationsResponse?.data) {
          const nextNotifications = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : [];
          setNotifications(nextNotifications.map(normalizeNotification));
        }

        if (activityLogsResponse?.data) {
          const nextLogs = Array.isArray(activityLogsResponse.data) ? activityLogsResponse.data : [];
          setActivityLogs(nextLogs.map(normalizeActivityLog));
        }

        if (dashboardResponse?.data) {
          setApiDashboardMetrics(dashboardResponse.data);
        }

        if (reportResponse?.data) {
          setApiReportMetrics(reportResponse.data);
        }
      } catch (error) {
      return { ok: false, message: error.message || 'Failed to add asset' };
    }
  };

  const validateAllocation = (assetId) => {
    const asset = assets.find((a) => a.id === assetId);

    if (!asset) {
      return { allowed: false, message: 'Asset not found in system.' };
    }

    if (asset.status === 'Allocated') {
      return {
        allowed: false,
        holder: asset.currentHolder,
        message: `Conflict: This asset is currently held by ${asset.currentHolder}.`,
      };
    }

    if (asset.status === 'Under Maintenance') {
      return {
        allowed: false,
        message: 'Conflict: This asset is currently under maintenance.',
      };
    }

    if (asset.status !== 'Available') {
      return {
        allowed: false,
        message: `Conflict: This asset is currently ${asset.status}.`,
      };
    }

    return { allowed: true };
  };

  const allocateAsset = async (assetId, employeeName, expectedReturnDate = '') => {
    if (typeof assetId === 'object' && assetId !== null) {
      const payload = assetId;
      assetId = payload.assetId;
      employeeName = payload.employeeName || payload.employeeId || payload.assignedTo;
      expectedReturnDate = payload.expectedReturnDate || '';
    }

    const validation = validateAllocation(assetId);
    if (!validation.allowed) return validation;

    const assetItem = assets.find((a) => a.id === assetId);
    const employee =
      employees.find((emp) => emp.id === Number(employeeName)) ||
      employees.find((emp) => emp.name === employeeName);

    const finalEmployeeName = employee?.name || employeeName;

    try {
      if (assetItem?.apiId && employee?.apiId) {
        await api.post('/allocations', {
          asset_id: assetItem.apiId,
          user_id: employee.apiId,
          expected_return_date: expectedReturnDate || new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.warn('Allocation API unavailable, using local state:', error.message);
    }

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: 'Allocated',
              currentHolder: finalEmployeeName,
              expectedReturnDate: expectedReturnDate || '',
            }
          : asset
      )
    );

    setAllocations((prev) => [
      {
        id: `ALC-${Date.now()}`,
        assetId,
        assetName: assetItem?.name || assetId,
        assignedTo: finalEmployeeName,
        assignedBy: currentUser?.name || 'Manager',
        date: todayString(),
        expectedReturnDate: expectedReturnDate || '',
        status: 'Active',
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now()}`,
        type: 'Asset Assigned',
        message: `Asset ${assetId} allocated to ${finalEmployeeName}.`,
        audience: finalEmployeeName,
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Allocated asset [${assetId}] to ${finalEmployeeName}`);
    return { ok: true, allowed: true };
  };

  const requestTransfer = (assetId, toEmployee) => {
    const asset = assets.find((a) => a.id === assetId);

    if (!asset) {
      return { ok: false, message: 'Asset not found.' };
    }

    if (asset.status !== 'Allocated') {
      return { ok: false, message: 'Only allocated assets can be transferred.' };
    }

    const employee =
      employees.find((emp) => emp.id === Number(toEmployee)) ||
      employees.find((emp) => emp.name === toEmployee);

    const finalToEmployee = employee?.name || toEmployee;

    if (asset.currentHolder === finalToEmployee) {
      return {
        ok: false,
        message: 'Selected employee already holds this asset.',
      };
    }

    const existingOpenRequest = transferRequests.find(
      (item) => item.assetId === assetId && item.status === 'Requested'
    );

    if (existingOpenRequest) {
      return {
        ok: false,
        message: 'A transfer request is already pending for this asset.',
      };
    }

    const newTransfer = {
      id: `TRF-${Date.now()}`,
      assetId,
      assetName: asset.name,
      fromEmployee: asset.currentHolder,
      toEmployee: finalToEmployee,
      requestedBy: currentUser?.name || 'Employee',
      status: 'Requested',
      requestedDate: todayString(),
    };

    setTransferRequests((prev) => [newTransfer, ...prev]);

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 1}`,
        type: 'Transfer Request',
        message: `Transfer requested for ${assetId} from ${asset.currentHolder} to ${finalToEmployee}.`,
        audience: 'Asset Manager',
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Transfer requested for ${assetId} to ${finalToEmployee}`);
    return { ok: true, transfer: newTransfer };
  };

  const approveTransfer = (transferId) => {
    const transfer = transferRequests.find((t) => t.id === transferId);

    if (!transfer) {
      return { ok: false, message: 'Transfer request not found.' };
    }

    if (transfer.status !== 'Requested') {
      return { ok: false, message: 'This transfer request is already processed.' };
    }

    setTransferRequests((prev) =>
      prev.map((item) =>
        item.id === transferId ? { ...item, status: 'Approved' } : item
      )
    );

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === transfer.assetId
          ? {
              ...asset,
              currentHolder: transfer.toEmployee,
              status: 'Allocated',
              expectedReturnDate: '',
            }
          : asset
      )
    );

    setAllocations((prev) => [
      {
        id: `ALC-${Date.now()}`,
        assetId: transfer.assetId,
        assetName: transfer.assetName,
        assignedTo: transfer.toEmployee,
        assignedBy: currentUser?.name || 'Asset Manager',
        date: todayString(),
        expectedReturnDate: '',
        status: 'Active',
      },
      ...prev.map((item) =>
        item.assetId === transfer.assetId && item.status === 'Active'
          ? { ...item, status: 'Transferred' }
          : item
      ),
    ]);

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 2}`,
        type: 'Transfer Approved',
        message: `Transfer approved for ${transfer.assetId} to ${transfer.toEmployee}.`,
        audience: transfer.toEmployee,
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Approved transfer ${transferId} for ${transfer.assetId}`);
    return { ok: true };
  };

  const returnAsset = (assetId) => {
    const assetItem = assets.find((a) => a.id === assetId);

    if (!assetItem) {
      return { ok: false, message: 'Asset not found.' };
    }

    if (assetItem.status !== 'Allocated') {
      return { ok: false, message: 'Only allocated assets can be returned.' };
    }

    const previousHolder = assetItem.currentHolder;

    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: 'Available',
              currentHolder: null,
              expectedReturnDate: '',
            }
          : asset
      )
    );

    setAllocations((prev) =>
      prev.map((record) =>
        record.assetId === assetId && record.status === 'Active'
          ? { ...record, status: 'Returned' }
          : record
      )
    );

    addActivityLog(
      `Processed return for asset [${assetId}] from ${previousHolder || 'Unknown user'}`
    );
    return { ok: true };
  };

  const validateBooking = (resourceId, date, startTime, endTime) => {
    const overlapping = bookings.find(
      (booking) =>
        booking.resourceId === resourceId &&
        booking.date === date &&
        booking.status !== 'Cancelled' &&
        startTime < booking.endTime &&
        endTime > booking.startTime
    );

    if (overlapping) {
      return {
        allowed: false,
        message: `Overlap detected: Already booked from ${overlapping.startTime} to ${overlapping.endTime}.`,
      };
    }

    return { allowed: true };
  };

  const addBooking = async (...args) => {
    let resourceId, user, date, startTime, endTime;

    if (typeof args[0] === 'object' && args[0] !== null) {
      const payload = args[0];
      resourceId = payload.resourceId || payload.assetId;
      user = payload.user || currentUser?.name || 'User';

      if (payload.date && payload.startTime && payload.endTime) {
        date = payload.date;
        startTime = payload.startTime;
        endTime = payload.endTime;
      } else if (payload.startTime && payload.endTime) {
        const [startDatePart, startTimePart] = payload.startTime.split('T');
        const [, endTimePart] = payload.endTime.split('T');
        date = startDatePart;
        startTime = startTimePart?.slice(0, 5);
        endTime = endTimePart?.slice(0, 5);
      }
    } else {
      [resourceId, user, date, startTime, endTime] = args;
    }

    const resource = assets.find((a) => a.id === resourceId);

    if (!resource) {
      return { ok: false, allowed: false, message: 'Selected resource not found.' };
    }

    if (!resource.isBookable) {
      return {
        ok: false,
        allowed: false,
        message: 'Selected asset is not marked as bookable.',
      };
    }

    if (!date || !startTime || !endTime) {
      return {
        ok: false,
        allowed: false,
        message: 'Date, start time, and end time are required.',
      };
    }

    const validation = validateBooking(resourceId, date, startTime, endTime);
    if (!validation.allowed) return { ok: false, ...validation };

    try {
      if (resource?.apiId && currentUser?.apiId) {
        const startDateTime = `${date}T${startTime}`;
        const endDateTime = `${date}T${endTime}`;
        await api.post('/bookings', {
          asset_id: resource.apiId,
          user_id: currentUser.apiId,
          start_time: startDateTime,
          end_time: endDateTime,
          purpose: 'Shared resource booking',
          status: 'upcoming',
        });
      }
    } catch (error) {
      console.warn('Booking API unavailable, using local state:', error.message);
    }

    const newBooking = {
      id: `BK-${Date.now()}`,
      resourceId,
      resourceName: resource.name,
      user,
      date,
      startTime,
      endTime,
      status: 'Confirmed',
    };

    setBookings((prev) => [newBooking, ...prev]);

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 3}`,
        type: 'Booking Confirmed',
        message: `${resource.name} booked by ${user} on ${date} from ${startTime} to ${endTime}.`,
        audience: user,
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Booking confirmed for [${resourceId}] by ${user} on ${date}`);
    return { ok: true, allowed: true, booking: newBooking };
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return { ok: false, message: 'Booking not found.' };
    }

    setBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId ? { ...item, status: 'Cancelled' } : item
      )
    );

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 4}`,
        type: 'Booking Cancelled',
        message: `Booking ${bookingId} has been cancelled.`,
        audience: booking.user,
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Cancelled booking reference [${bookingId}]`);
    return { ok: true };
  };

  const raiseMaintenance = async (...args) => {
    let assetId, description, priority;

    if (typeof args[0] === 'object' && args[0] !== null) {
      const payload = args[0];
      assetId = payload.assetId;
      description = payload.description || payload.issueDescription;
      priority = payload.priority || 'Medium';
    } else {
      [assetId, description, priority = 'Medium'] = args;
    }

    const asset = assets.find((a) => a.id === assetId);

    if (!asset) {
      return { ok: false, message: 'Asset not found.' };
    }

    if (asset.status === 'Retired' || asset.status === 'Disposed' || asset.status === 'Lost') {
      return { ok: false, message: 'This asset cannot enter maintenance workflow.' };
    }

    try {
      if (asset?.apiId && currentUser?.apiId) {
        await api.post('/maintenance', {
          asset_id: asset.apiId,
          reason: description,
          notes: priority,
        });
      }
    } catch (error) {
      console.warn('Maintenance API unavailable, using local state:', error.message);
    }

    const newRequest = {
      id: `MNT-${Date.now()}`,
      assetId,
      description,
      priority,
      status: 'Pending',
      requestedBy: currentUser?.name || 'User',
    };

    setMaintenanceRequests((prev) => [newRequest, ...prev]);

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 5}`,
        type: 'Maintenance Requested',
        message: `Maintenance request raised for ${assetId}.`,
        audience: 'Asset Manager',
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Raised maintenance request for ${assetId}`);
    return { ok: true, request: newRequest };
  };

  const addMaintenanceRequest = (payload) => raiseMaintenance(payload);

  const updateMaintenanceStatus = async (requestId, nextStatus) => {
    const request = maintenanceRequests.find((m) => m.id === requestId);

    if (!request) {
      return { ok: false, message: 'Maintenance request not found.' };
    }

    try {
      if (request?.apiId) {
        const payload = {
          status: nextStatus.toLowerCase().replace(/ /g, '_'),
        };
        await api.patch(`/maintenance/${request.apiId}/status`, payload);
      }
    } catch (error) {
      console.warn('Maintenance update API unavailable, using local state:', error.message);
    }

    setMaintenanceRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status: nextStatus } : item
      )
    );

    if (['Approved', 'Technician Assigned', 'In Progress'].includes(nextStatus)) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === request.assetId
            ? { ...asset, status: 'Under Maintenance' }
            : asset
        )
      );
    }

    if (nextStatus === 'Rejected' || nextStatus === 'Resolved') {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === request.assetId
            ? { ...asset, status: 'Available' }
            : asset
        )
      );
    }

    setNotifications((prev) => [
      {
        id: `NTF-${Date.now() + 6}`,
        type: `Maintenance ${nextStatus}`,
        message: `Maintenance request ${requestId} updated to ${nextStatus}.`,
        audience: request.requestedBy,
        timestamp: createTimestamp(),
        read: false,
      },
      ...prev,
    ]);

    addActivityLog(`Maintenance request ${requestId} updated to ${nextStatus}`);
    return { ok: true };
  };

  const createAuditCycle = ({ name, scope, auditor, startDate, endDate }) => {
    const newCycle = {
      id: `AUD-${Date.now()}`,
      name,
      scope,
      auditor,
      startDate,
      endDate,
      status: 'Open',
      items: assets.map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        verificationStatus: 'Pending',
      })),
    };

    setAuditCycles((prev) => [newCycle, ...prev]);
    addActivityLog(`Created audit cycle ${name}`);
    return { ok: true, cycle: newCycle };
  };

  const markAuditItem = (cycleId, assetId, verificationStatus) => {
    setAuditCycles((prev) =>
      prev.map((cycle) =>
        cycle.id === cycleId
          ? {
              ...cycle,
              items: cycle.items.map((item) =>
                item.assetId === assetId
                  ? { ...item, verificationStatus }
                  : item
              ),
            }
          : cycle
      )
    );

    if (verificationStatus === 'Missing' || verificationStatus === 'Damaged') {
      setNotifications((prev) => [
        {
          id: `NTF-${Date.now() + 7}`,
          type: 'Audit Discrepancy Flagged',
          message: `Audit discrepancy on ${assetId}: ${verificationStatus}.`,
          audience: 'Asset Manager',
          timestamp: createTimestamp(),
          read: false,
        },
        ...prev,
      ]);
    }

    addActivityLog(`Audit item ${assetId} marked as ${verificationStatus}`);
    return { ok: true };
  };

  const closeAuditCycle = (cycleId) => {
    const cycle = auditCycles.find((c) => c.id === cycleId);

    if (!cycle) {
      return { ok: false, message: 'Audit cycle not found.' };
    }

    setAuditCycles((prev) =>
      prev.map((item) =>
        item.id === cycleId ? { ...item, status: 'Closed' } : item
      )
    );

    const missingAssetIds = cycle.items
      .filter((item) => item.verificationStatus === 'Missing')
      .map((item) => item.assetId);

    if (missingAssetIds.length > 0) {
      setAssets((prev) =>
        prev.map((asset) =>
          missingAssetIds.includes(asset.id)
            ? { ...asset, status: 'Lost' }
            : asset
        )
      );
    }

    addActivityLog(`Closed audit cycle ${cycleId}`);
    return { ok: true };
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      )
    );
    return { ok: true };
  };

  const enrichedAssets = useMemo(() => {
    return assets.map((asset) => ({
      ...asset,
      isOverdue: isAssetOverdue(asset),
    }));
  }, [assets]);

  const dashboardStats = useMemo(() => {
    const assetsAvailable = enrichedAssets.filter((a) => a.status === 'Available').length;
    const assetsAllocated = enrichedAssets.filter((a) => a.status === 'Allocated').length;
    const maintenanceToday = maintenanceRequests.filter((m) =>
      ['Pending', 'Approved', 'In Progress', 'Technician Assigned'].includes(m.status)
    ).length;
    const activeBookings = bookings.filter((b) => b.status === 'Confirmed').length;
    const pendingTransfers = transferRequests.filter((t) => t.status === 'Requested').length;
    const overdueReturns = enrichedAssets.filter((a) => a.isOverdue).length;
    const upcomingReturns = enrichedAssets.filter(
      (a) => a.expectedReturnDate && a.status === 'Allocated' && !a.isOverdue
    ).length;

    const fallback = {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      overdueReturns,
      upcomingReturns,
    };

    if (!apiDashboardMetrics) return fallback;

    return {
      ...fallback,
      assetsAvailable: apiDashboardMetrics.assetsAvailable ?? fallback.assetsAvailable,
      assetsAllocated: apiDashboardMetrics.assetsAllocated ?? fallback.assetsAllocated,
      maintenanceToday: apiDashboardMetrics.pendingMaintenance ?? fallback.maintenanceToday,
      activeBookings: apiDashboardMetrics.activeBookings ?? fallback.activeBookings,
      pendingTransfers: apiDashboardMetrics.pendingTransfers ?? fallback.pendingTransfers,
      overdueReturns: apiDashboardMetrics.overdueReturns ?? fallback.overdueReturns,
      upcomingReturns: fallback.upcomingReturns,
    };
  }, [enrichedAssets, maintenanceRequests, bookings, transferRequests, apiDashboardMetrics]);

  const reportData = useMemo(() => {
    const maintenanceByCategory = categories.map((category) => ({
      category: category.name,
      count: maintenanceRequests.filter((request) => {
        const asset = enrichedAssets.find((a) => a.id === request.assetId);
        return asset?.category === category.name;
      }).length,
    }));

    const allocationByDepartment = departments.map((department) => ({
      department: department.name,
      count: employees
        .filter((emp) => emp.departmentId === department.id)
        .reduce((sum, emp) => {
          return (
            sum +
            enrichedAssets.filter(
              (asset) =>
                asset.currentHolder === emp.name && asset.status === 'Allocated'
            ).length
          );
        }, 0),
    }));

    const bookingUsage = enrichedAssets
      .filter((asset) => asset.isBookable)
      .map((asset) => ({
        resource: asset.name,
        count: bookings.filter(
          (booking) =>
            booking.resourceId === asset.id && booking.status === 'Confirmed'
        ).length,
      }));

    const fallback = {
      maintenanceByCategory,
      allocationByDepartment,
      bookingUsage,
      totalAssets: enrichedAssets.length,
      idleAssets: enrichedAssets.filter((a) => a.status === 'Available').length,
      utilizedAssets: enrichedAssets.filter((a) => a.status === 'Allocated').length,
    };

    if (!apiReportMetrics) return fallback;

    const summary = apiReportMetrics.summary || {};
    return {
      ...fallback,
      totalAssets: summary.totalAssets ?? fallback.totalAssets,
      idleAssets: summary.assetsAvailable ?? fallback.idleAssets,
      utilizedAssets: summary.assetsAllocated ?? fallback.utilizedAssets,
    };
  }, [enrichedAssets, maintenanceRequests, categories, departments, employees, bookings, apiReportMetrics]);

  return (
    <MockDataContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        organization,
        setOrganization,
        departments,
        setDepartments,
        categories,
        setCategories,
        employees,
        setEmployees,
        assets: enrichedAssets,
        setAssets,
        allocations,
        setAllocations,
        transferRequests,
        setTransferRequests,
        bookings,
        setBookings,
        maintenanceRequests,
        setMaintenanceRequests,
        auditCycles,
        setAuditCycles,
        notifications,
        setNotifications,
        activityLogs,
        setActivityLogs,
        dashboardStats,
        reportData,
        loginUser,
        signupUser,
        logoutUser,
        navigateTo,
        completeSetup,
        promoteEmployee,
        addAsset,
        validateAllocation,
        allocateAsset,
        requestTransfer,
        approveTransfer,
        returnAsset,
        validateBooking,
        addBooking,
        cancelBooking,
        raiseMaintenance,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        createAuditCycle,
        markAuditItem,
        closeAuditCycle,
        markNotificationRead,
        addActivityLog,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => useContext(MockDataContext);
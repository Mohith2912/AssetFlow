import React, { createContext, useContext, useMemo, useState } from 'react';

const MockDataContext = createContext(null);

export const MockDataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [organization, setOrganization] = useState({
    name: 'AssetFlow Demo Workspace',
  });

  const [departments, setDepartments] = useState([
    { id: 101, name: 'Engineering', head: 'Navaneeth', parentDepartment: '', status: 'Active' },
    { id: 102, name: 'Design & UX', head: 'Nadya', parentDepartment: '', status: 'Active' },
    { id: 103, name: 'Operations', head: '', parentDepartment: '', status: 'Active' },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', warrantyPeriod: '24 Months' },
    { id: 2, name: 'Spaces', warrantyPeriod: 'N/A' },
    { id: 3, name: 'Furniture', warrantyPeriod: '12 Months' },
  ]);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Navaneeth',
      email: 'navaneeth@company.com',
      departmentId: 101,
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Poshika',
      email: 'poshika@company.com',
      departmentId: 101,
      role: 'Asset Manager',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Nadya',
      email: 'nadya@company.com',
      departmentId: 102,
      role: 'Department Head',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Mohith',
      email: 'mohith@company.com',
      departmentId: 103,
      role: 'Employee',
      status: 'Active',
    },
  ]);

  const [assets, setAssets] = useState([
    {
      id: 'AF-0001',
      name: 'MacBook Pro M3',
      category: 'Electronics',
      status: 'Allocated',
      currentHolder: 'Mohith',
      location: 'Lab 2',
      department: 'Operations',
      condition: 'Good',
      acquisitionDate: '2026-06-20',
      acquisitionCost: '145000',
      notes: 'Demo laptop for allocation flow',
      serialNumber: 'SN-MB-1001',
      isBookable: false,
      expectedReturnDate: '2026-07-10',
    },
    {
      id: 'AF-0002',
      name: 'Conference Room B2',
      category: 'Spaces',
      status: 'Available',
      currentHolder: null,
      location: 'Floor 2',
      department: 'Engineering',
      condition: 'Excellent',
      acquisitionDate: '2026-05-10',
      acquisitionCost: '',
      notes: '',
      serialNumber: 'SN-SP-2001',
      isBookable: true,
      expectedReturnDate: '',
    },
    {
      id: 'AF-0003',
      name: 'ThinkPad X1 Carbon',
      category: 'Electronics',
      status: 'Under Maintenance',
      currentHolder: null,
      location: 'IT Support Desk',
      department: 'Engineering',
      condition: 'Fair',
      acquisitionDate: '2026-04-15',
      acquisitionCost: '98000',
      notes: 'Display issue under service',
      serialNumber: 'SN-LT-3001',
      isBookable: false,
      expectedReturnDate: '',
    },
    {
      id: 'AF-0004',
      name: 'Projector Epson X8',
      category: 'Electronics',
      status: 'Available',
      currentHolder: null,
      location: 'Meeting Hall',
      department: 'Design & UX',
      condition: 'Good',
      acquisitionDate: '2026-03-05',
      acquisitionCost: '52000',
      notes: '',
      serialNumber: 'SN-PJ-4001',
      isBookable: true,
      expectedReturnDate: '',
    },
  ]);

  const [allocations, setAllocations] = useState([
    {
      id: 'ALC-1001',
      assetId: 'AF-0001',
      assetName: 'MacBook Pro M3',
      assignedTo: 'Mohith',
      assignedBy: 'Navaneeth',
      date: '2026-07-08',
      expectedReturnDate: '2026-07-10',
      status: 'Active',
    },
  ]);

  const [transferRequests, setTransferRequests] = useState([
    {
      id: 'TRF-1001',
      assetId: 'AF-0001',
      assetName: 'MacBook Pro M3',
      fromEmployee: 'Mohith',
      toEmployee: 'Nadya',
      requestedBy: 'Nadya',
      status: 'Requested',
      requestedDate: '2026-07-12',
    },
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 'BK-501',
      resourceId: 'AF-0002',
      resourceName: 'Conference Room B2',
      user: 'Nadya',
      date: '2026-07-12',
      startTime: '09:00',
      endTime: '10:00',
      status: 'Confirmed',
    },
  ]);

  const [maintenanceRequests, setMaintenanceRequests] = useState([
    {
      id: 'MNT-1001',
      assetId: 'AF-0003',
      description: 'Keyboard and display issue',
      priority: 'High',
      status: 'In Progress',
      requestedBy: 'Poshika',
    },
  ]);

  const [auditCycles, setAuditCycles] = useState([
    {
      id: 'AUD-1001',
      name: 'July Engineering Audit',
      scope: 'Engineering / Lab 2',
      auditor: 'Nadya',
      startDate: '2026-07-12',
      endDate: '2026-07-14',
      status: 'Open',
      items: [
        {
          assetId: 'AF-0001',
          assetName: 'MacBook Pro M3',
          verificationStatus: 'Missing',
        },
        {
          assetId: 'AF-0002',
          assetName: 'Conference Room B2',
          verificationStatus: 'Verified',
        },
      ],
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 'NTF-1001',
      type: 'Overdue Return Alert',
      message: 'Asset AF-0001 is overdue for return.',
      audience: 'Asset Manager',
      timestamp: '2026-07-12 09:45:00',
      read: false,
    },
    {
      id: 'NTF-1002',
      type: 'Booking Reminder',
      message: 'Conference Room B2 booking starts at 09:00.',
      audience: 'Nadya',
      timestamp: '2026-07-12 08:30:00',
      read: false,
    },
  ]);

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      user: 'Navaneeth',
      action: 'User session authenticated cleanly',
      timestamp: '2026-07-12 10:15:00',
    },
    {
      id: 2,
      user: 'System',
      action: 'Overdue verification routine executed',
      timestamp: '2026-07-12 09:00:00',
    },
  ]);

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

  const loginUser = (email, role) => {
    const matchedEmployee = employees.find((emp) => emp.email === email);
    let loggedInUser;

    if (matchedEmployee) {
      loggedInUser = matchedEmployee;
      setCurrentUser(matchedEmployee);
      addActivityLog(`Signed in as ${matchedEmployee.role}`, matchedEmployee.name);
    } else {
      const username = email.split('@')[0];
      loggedInUser = {
        id: Date.now(),
        name: username,
        email,
        role: role || 'Employee',
        departmentId: 101,
        status: 'Active',
      };
      setCurrentUser(loggedInUser);
      addActivityLog(`Signed in as ${loggedInUser.role}`, username);
    }

    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
    return { ok: true, user: loggedInUser };
  };

  const logoutUser = () => {
    addActivityLog('Signed out', currentUser?.name || 'User');
    setCurrentUser(null);
    setCurrentScreen('login');
    setActiveTab('dashboard');
    return { ok: true };
  };

  const navigateTo = (screen, tab = 'dashboard') => {
    if (screen === 'orgSetup' && currentUser?.role !== 'Admin') {
      return { ok: false, message: 'Only Admin can access Organization Setup.' };
    }

    setCurrentScreen(screen);
    setActiveTab(tab);
    return { ok: true };
  };

  const completeSetup = (orgName) => {
    const finalOrgName = orgName?.trim() || organization.name;
    setOrganization({ name: finalOrgName });
    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
    addActivityLog(`Organization setup completed: ${finalOrgName}`);
    return { ok: true };
  };

  const promoteEmployee = (empId, newRole) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === empId ? { ...employee, role: newRole } : employee
      )
    );
    addActivityLog(`Promoted employee ID ${empId} to ${newRole}`);
    return { ok: true };
  };

  const addAsset = (assetData) => {
    const nextNumber = String(assets.length + 1).padStart(4, '0');

    const newAsset = {
      id: `AF-${nextNumber}`,
      name: assetData.name,
      category: assetData.category,
      status: 'Available',
      currentHolder: null,
      location: assetData.location || 'Main Office',
      department: assetData.department || '',
      condition: assetData.condition || 'Good',
      acquisitionDate: assetData.acquisitionDate || '',
      acquisitionCost: assetData.acquisitionCost || '',
      notes: assetData.notes || '',
      serialNumber: assetData.serialNumber || `SN-${Date.now()}`,
      isBookable: !!assetData.isBookable,
      expectedReturnDate: '',
    };

    setAssets((prev) => [newAsset, ...prev]);
    addActivityLog(`Registered new asset ${newAsset.id} - ${newAsset.name}`);
    return { ok: true, asset: newAsset };
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

  const allocateAsset = (assetId, employeeName, expectedReturnDate = '') => {
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

  const addBooking = (...args) => {
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

  const raiseMaintenance = (...args) => {
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

  const updateMaintenanceStatus = (requestId, nextStatus) => {
    const request = maintenanceRequests.find((m) => m.id === requestId);

    if (!request) {
      return { ok: false, message: 'Maintenance request not found.' };
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

    return {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      overdueReturns,
      upcomingReturns,
    };
  }, [enrichedAssets, maintenanceRequests, bookings, transferRequests]);

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

    return {
      maintenanceByCategory,
      allocationByDepartment,
      bookingUsage,
      totalAssets: enrichedAssets.length,
      idleAssets: enrichedAssets.filter((a) => a.status === 'Available').length,
      utilizedAssets: enrichedAssets.filter((a) => a.status === 'Allocated').length,
    };
  }, [enrichedAssets, maintenanceRequests, categories, departments, employees, bookings]);

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
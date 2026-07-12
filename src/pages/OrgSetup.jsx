import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function OrgSetup() {
  const {
    employees,
    departments,
    setDepartments,
    categories,
    setCategories,
    promoteEmployee,
    setEmployees,
    currentUser,
    completeSetup,
  } = useMockData();

  const [activeTab, setActiveTab] = useState('departments');
  const [orgName, setOrgName] = useState('AssetFlow Demo Workspace');

  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [parentDept, setParentDept] = useState('');

  const [catName, setCatName] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');

  const employeeOptions = useMemo(
    () => employees.filter((emp) => emp.status !== 'Inactive'),
    [employees]
  );

  const getDepartmentName = (departmentId) =>
    departments.find((dept) => dept.id === departmentId)?.name || 'Unassigned';

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    const exists = departments.some(
      (dept) => dept.name.toLowerCase() === deptName.trim().toLowerCase()
    );
    if (exists) return;

    setDepartments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: deptName.trim(),
        head: deptHead || '',
        parentDepartment: parentDept || '',
        status: 'Active',
      },
    ]);

    setDeptName('');
    setDeptHead('');
    setParentDept('');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const exists = categories.some(
      (category) => category.name.toLowerCase() === catName.trim().toLowerCase()
    );
    if (exists) return;

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: catName.trim(),
        warrantyPeriod: warrantyPeriod.trim() || 'N/A',
      },
    ]);

    setCatName('');
    setWarrantyPeriod('');
  };

  const toggleDepartmentStatus = (id) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === id
          ? {
              ...dept,
              status: dept.status === 'Active' ? 'Inactive' : 'Active',
            }
          : dept
      )
    );
  };

  const toggleEmployeeStatus = (id) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              status: emp.status === 'Active' ? 'Inactive' : 'Active',
            }
          : emp
      )
    );
  };

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="premium-card p-6">
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          Organization Setup is available to Admin users only.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="hero-dark rounded-[30px] p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Admin workspace initialization
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white">
                Configure AssetFlow Workspace
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Maintain departments, asset categories, and employee role assignments
                before launching the main ERP dashboard.
              </p>
            </div>

            <div className="glass-card rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Admin session
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {currentUser?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-500">{currentUser?.role || 'Admin'}</p>
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Organization name
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="soft-input flex-1 rounded-2xl px-4 py-3 text-sm"
              placeholder="Enter organization name"
            />
            <button
              onClick={() => completeSetup(orgName)}
              className="btn-primary rounded-2xl px-6 py-3 text-sm font-semibold"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { key: 'departments', label: 'Departments' },
            { key: 'categories', label: 'Asset Categories' },
            { key: 'directory', label: 'Employee Directory' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'hero-dark text-white shadow-lg'
                  : 'premium-card text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="premium-card p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Add Department</h3>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <input
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Department name"
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                />

                <select
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                >
                  <option value="">Select department head</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>

                <select
                  value={parentDept}
                  onChange={(e) => setParentDept(e.target.value)}
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                >
                  <option value="">Select parent department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <button className="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold">
                  Save Department
                </button>
              </form>
            </div>

            <div className="premium-card xl:col-span-2 p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Department List</h3>
              <div className="grid gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-blue-50/60 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{dept.name}</p>
                        <p className="text-sm text-slate-500">
                          Head: {dept.head || 'Unassigned'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Parent: {dept.parentDepartment || 'None'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            dept.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {dept.status}
                        </span>
                        <button
                          onClick={() => toggleDepartmentStatus(dept.id)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="premium-card p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Add Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Category name"
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                />
                <input
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  placeholder="Warranty period"
                  className="soft-input w-full rounded-2xl px-4 py-3 text-sm"
                />
                <button className="btn-warning w-full rounded-2xl px-4 py-3 text-sm font-semibold">
                  Save Category
                </button>
              </form>
            </div>

            <div className="premium-card xl:col-span-2 p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Category List</h3>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-2xl border border-amber-100 bg-gradient-to-r from-white to-amber-50/70 p-4"
                  >
                    <p className="font-semibold text-slate-800">{category.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Warranty: {category.warrantyPeriod}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="premium-card p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Employee Directory</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Promote employees to Department Head or Asset Manager from this admin-only panel.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {employees.length} employees
              </span>
            </div>

            <div className="table-wrap mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-semibold text-slate-800">{emp.name}</td>
                      <td className="px-4 py-4 text-slate-600">{emp.email}</td>
                      <td className="px-4 py-4 text-slate-600">
                        {getDepartmentName(emp.departmentId)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{emp.role}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => promoteEmployee(emp.id, 'Employee')}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                          >
                            Employee
                          </button>
                          <button
                            onClick={() => promoteEmployee(emp.id, 'Department Head')}
                            className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                          >
                            Dept Head
                          </button>
                          <button
                            onClick={() => promoteEmployee(emp.id, 'Asset Manager')}
                            className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            Asset Manager
                          </button>
                          <button
                            onClick={() => toggleEmployeeStatus(emp.id)}
                            className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                          >
                            {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
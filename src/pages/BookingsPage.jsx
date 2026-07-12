import React, { useMemo, useState } from 'react';
import { useMockData } from '../context/MockDataContext';

export default function BookingsPage() {
  const { bookings = [], assets = [], currentUser, addBooking, cancelBooking } = useMockData();

  const today = new Date().toISOString().split('T')[0];

  const [selectedAsset, setSelectedAsset] = useState('');
  const [bookingDate, setBookingDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [filterResource, setFilterResource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const bookableResources = useMemo(
    () =>
      assets.filter(
        (asset) => asset.isBookable || asset.category === 'Spaces'
      ),
    [assets]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const resourceId = booking.resourceId || booking.assetId;
      const matchesResource =
        filterResource === 'All' || resourceId === filterResource;
      const matchesStatus =
        filterStatus === 'All' || booking.status === filterStatus;

      return matchesResource && matchesStatus;
    });
  }, [bookings, filterResource, filterStatus]);

  const selectedResourceBookings = useMemo(() => {
    if (!selectedAsset) return [];

    return bookings
      .filter((booking) => {
        const resourceId = booking.resourceId || booking.assetId;
        return resourceId === selectedAsset && booking.status !== 'Cancelled';
      })
      .sort((a, b) => {
        const first = `${a.date} ${a.startTime}`;
        const second = `${b.date} ${b.startTime}`;
        return first.localeCompare(second);
      });
  }, [bookings, selectedAsset]);

  const handleCreateBooking = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedAsset || !bookingDate || !startTime || !endTime) {
      setErrorMessage('Please fill in all booking fields.');
      return;
    }

    if (bookingDate < today) {
      setErrorMessage('Booking date cannot be in the past.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('End time must be later than the start time.');
      return;
    }

    const result = addBooking(
      selectedAsset,
      currentUser?.name || 'Employee',
      bookingDate,
      startTime,
      endTime
    );

    if (!result?.ok) {
      setErrorMessage(
        result?.message ||
          'Scheduling conflict: this resource is already booked for the selected slot.'
      );
      return;
    }

    setSuccessMessage('Booking created successfully.');
    setSelectedAsset('');
    setStartTime('');
    setEndTime('');
  };

  const handleCancelBooking = (id) => {
    setErrorMessage('');
    setSuccessMessage('');

    const result = cancelBooking(id);

    if (result?.ok) {
      setSuccessMessage(`Booking ${id} has been cancelled.`);
    } else {
      setErrorMessage(result?.message || 'Unable to cancel booking.');
    }
  };

  const canCancelBooking = (booking) => {
    const owner = booking.user || booking.bookedBy;
    return (
      owner === currentUser?.name ||
      currentUser?.role === 'Admin' ||
      currentUser?.role === 'Department Head'
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700';
      case 'Upcoming':
        return 'bg-cyan-50 text-cyan-700';
      case 'Ongoing':
        return 'bg-indigo-50 text-indigo-700';
      case 'Completed':
        return 'bg-slate-100 text-slate-700';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">
          Resource Booking
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Reserve shared rooms, vehicles, and bookable assets with overlap-safe time slots.
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
        <div className="premium-card space-y-4 p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create Booking</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Schedule a shared resource without overlapping an existing active slot.
            </p>
          </div>

          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Select Resource
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
                required
              >
                <option value="">Choose bookable resource</option>
                {bookableResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} [{resource.id}] ({resource.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                min={today}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white"
            >
              Confirm Booking
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overlap rule
            </p>
            <p className="mt-2 text-sm text-slate-600">
              A booking is rejected if its time range overlaps an active booking for the same
              resource, while back-to-back slots such as 10:00–11:00 after 09:00–10:00 are valid.
            </p>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <div className="premium-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Existing bookings</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Track all current reservation records and booking statuses.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={filterResource}
                  onChange={(e) => setFilterResource(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="All">All resources</option>
                  {bookableResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="All">All statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">Resource</th>
                    <th className="pb-3">Booked By</th>
                    <th className="pb-3">Schedule</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5">
                          <p className="font-bold text-slate-800">
                            {booking.resourceName || booking.assetName || booking.resourceId}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {booking.resourceId || booking.assetId}
                          </p>
                        </td>
                        <td className="py-3.5 text-slate-700">
                          {booking.user || booking.bookedBy}
                        </td>
                        <td className="py-3.5 font-mono text-slate-500">
                          {booking.date} ({booking.startTime} - {booking.endTime})
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {booking.status === 'Confirmed' && canCancelBooking(booking) ? (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-[11px] font-bold text-rose-600 hover:underline"
                            >
                              Cancel Booking
                            </button>
                          ) : (
                            <span className="text-[11px] italic text-slate-300">
                              No Action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-sm italic text-slate-400"
                      >
                        No bookings match the current filter selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="premium-card p-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Selected resource schedule
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Quick view of existing bookings for the resource currently selected in the form.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {selectedAsset ? (
                selectedResourceBookings.length > 0 ? (
                  selectedResourceBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {booking.date} · {booking.startTime} - {booking.endTime}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Reserved by {booking.user || booking.bookedBy}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    No active bookings found for the selected resource.
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400">
                  Select a resource to preview its current booking schedule.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
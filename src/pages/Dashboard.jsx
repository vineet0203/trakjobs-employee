import { useEffect, useMemo, useState } from 'react';
import {
  checkIn,
  checkOut,
  getDashboard,
  getTimeEntries,
  updateTimeEntry,
} from '../api/timeTracking';
import { getEmployeeListings } from '../api/listings';
import CalendarView from '../components/CalendarView';
import Listings from '../components/Listings';
import TimeTracker from '../components/TimeTracker';
import EditEntryModal from '../components/time-tracking/EditEntryModal';
import TimeEntriesTable from '../components/time-tracking/TimeEntriesTable';
import './Dashboard.css';

const getMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const computeElapsedSeconds = (activeEntry) => {
  if (!activeEntry?.check_in) return 0;

  const nowMs = Date.now();
  const checkInMs = new Date(activeEntry.check_in).getTime();
  const breakSeconds = Number(activeEntry.break_seconds || 0);
  const activeBreakSeconds =
    activeEntry.is_on_break && activeEntry.active_break_start
      ? Math.floor((nowMs - new Date(activeEntry.active_break_start).getTime()) / 1000)
      : 0;

  return Math.max(0, Math.floor((nowMs - checkInMs) / 1000) - breakSeconds - activeBreakSeconds);
};

const defaultPagination = {
  current_page: 1,
  last_page: 1,
  per_page: 5,
  total: 0,
};

const defaultHours = {
  today: 0,
  week: 0,
  month: 0,
};

const formatHours = (seconds) => {
  const value = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(value / 3600);
  const mins = Math.floor((value % 3600) / 60);
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [activeSession, setActiveSession] = useState(null);

  const [isWorking, setIsWorking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [activeSeedSeconds, setActiveSeedSeconds] = useState(0);
  const [workingHours, setWorkingHours] = useState(defaultHours);

  const [allListings, setAllListings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [toast, setToast] = useState({ type: '', message: '' });
  const [editingEntry, setEditingEntry] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const employeeName = useMemo(() => {
    try {
      const raw = localStorage.getItem('employee_auth_employee');
      if (!raw) return 'Employee';
      const parsed = JSON.parse(raw);
      return parsed?.name || parsed?.full_name || parsed?.email || 'Employee';
    } catch {
      return 'Employee';
    }
  }, []);

  useEffect(() => {
    if (!toast.message) return;

    const timeoutId = setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!isWorking || !activeSession?.check_in) return;

    setSeconds(computeElapsedSeconds(activeSession));

    const intervalId = setInterval(() => {
      setSeconds(computeElapsedSeconds(activeSession));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isWorking, activeSession]);

  const loadDashboard = async ({ withLoader = false } = {}) => {
    if (withLoader) {
      setDashboardLoading(true);
    }

    try {
      const response = await getDashboard();
      const data = response?.data?.data || {};

      setJobs(data.jobs || []);
      setEntries(data.entries || []);
      setPagination(data.entries_pagination || defaultPagination);
      setWorkingHours(data.working_hours || defaultHours);

      const active = data.active_entry;
      if (active) {
        const liveSeconds = computeElapsedSeconds(active);
        setActiveSession(active);
        setIsWorking(true);
        setActiveEntryId(active.id);
        setSelectedJob(String(active.job_id || ''));
        setSeconds(liveSeconds);
        setActiveSeedSeconds(liveSeconds);
      } else {
        setActiveSession(null);
        setIsWorking(false);
        setActiveEntryId(null);
        setSeconds(0);
        setActiveSeedSeconds(0);
      }
    } catch (error) {
      setToast({ type: 'error', message: getMessage(error, 'Failed to load dashboard.') });
    } finally {
      if (withLoader) {
        setDashboardLoading(false);
      }
    }
  };

  const loadListings = async () => {
    setListingsLoading(true);
    setListingsError('');

    try {
      const response = await getEmployeeListings();
      const items = response?.data?.data?.items || [];
      setAllListings(items);
    } catch (error) {
      setListingsError(getMessage(error, 'Failed to load listings.'));
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadDashboard({ withLoader: true }), loadListings()]);
    };

    init();
  }, []);

  useEffect(() => {
    if (!isWorking) return;

    const refreshId = setInterval(() => {
      loadDashboard();
    }, 60000);

    return () => clearInterval(refreshId);
  }, [isWorking]);

  const loadEntries = async (page) => {
    setTableLoading(true);
    try {
      const response = await getTimeEntries(page, pagination.per_page);
      const data = response?.data?.data || {};
      setEntries(data.items || []);
      setPagination(data.pagination || defaultPagination);
    } catch (error) {
      setToast({ type: 'error', message: getMessage(error, 'Failed to load entries.') });
    } finally {
      setTableLoading(false);
    }
  };

  const handleStart = async () => {
    if (!selectedJob) {
      setToast({ type: 'error', message: 'Please select a job first.' });
      return;
    }

    setActionLoading(true);
    try {
      const response = await checkIn({ job_id: Number(selectedJob) });
      const entry = response?.data?.data?.entry;
      const liveSeconds = computeElapsedSeconds(entry);

      setActiveSession(entry || null);
      setIsWorking(true);
      setActiveEntryId(entry?.id || null);
      setSeconds(liveSeconds);
      setActiveSeedSeconds(liveSeconds);
      setToast({ type: 'success', message: 'Checked in successfully.' });
      await Promise.all([loadDashboard(), loadEntries(1)]);
    } catch (error) {
      setToast({ type: 'error', message: getMessage(error, 'Check-in failed.') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeEntryId) return;

    setActionLoading(true);
    try {
      await checkOut({ time_entry_id: activeEntryId });

      setActiveSession(null);
      setIsWorking(false);
      setSeconds(0);
      setActiveSeedSeconds(0);
      setActiveEntryId(null);
      setToast({ type: 'success', message: 'Checked out successfully.' });
      await Promise.all([loadDashboard(), loadEntries(1)]);
    } catch (error) {
      setToast({ type: 'error', message: getMessage(error, 'Check-out failed.') });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async ({ id, start_time, end_time }) => {
    const nextStart = new Date(start_time.replace(' ', 'T')).getTime();
    const nextEnd = new Date(end_time.replace(' ', 'T')).getTime();

    const hasLocalOverlap = entries.some((entry) => {
      if (entry.id === id || !entry.check_out) return false;

      const existingStart = new Date(entry.check_in).getTime();
      const existingEnd = new Date(entry.check_out).getTime();

      return nextStart < existingEnd && nextEnd > existingStart;
    });

    if (hasLocalOverlap) {
      setToast({ type: 'error', message: 'Time range overlaps with another entry.' });
      return;
    }

    setEditLoading(true);
    try {
      await updateTimeEntry(id, { start_time, end_time });
      setToast({ type: 'success', message: 'Entry updated successfully.' });
      setEditingEntry(null);
      await loadEntries(pagination.current_page);
    } catch (error) {
      setToast({ type: 'error', message: getMessage(error, 'Failed to update entry.') });
    } finally {
      setEditLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    if (!selectedDate) return allListings;

    const key = toDateKey(selectedDate);
    return allListings.filter((item) => toDateKey(item.date) === key);
  }, [allListings, selectedDate]);

  const approvedListings = useMemo(
    () => filteredListings.filter((item) => item.status === 'approved'),
    [filteredListings]
  );

  const pendingListings = useMemo(
    () => filteredListings.filter((item) => item.status !== 'approved'),
    [filteredListings]
  );

  const displayWorkingHours = useMemo(() => {
    if (!activeSession?.check_in || !isWorking) {
      return workingHours;
    }

    const delta = Math.max(0, seconds - activeSeedSeconds);
    if (delta <= 0) {
      return workingHours;
    }

    const activeDate = new Date(activeSession.check_in);
    if (Number.isNaN(activeDate.getTime())) {
      return workingHours;
    }

    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart);
    weekStart.setDate(dayStart.getDate() - dayStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: workingHours.today + (activeDate >= dayStart ? delta : 0),
      week: workingHours.week + (activeDate >= weekStart ? delta : 0),
      month: workingHours.month + (activeDate >= monthStart ? delta : 0),
    };
  }, [workingHours, activeSession, isWorking, seconds, activeSeedSeconds]);

  return (
    <div className="employee-dashboard">
      <section>
        <p className="employee-dashboard-overline">Dashboard</p>
        <h1 className="employee-dashboard-title">Time Tracking Dashboard</h1>
      </section>

      {toast.message ? (
        <div className={`employee-toast ${toast.type === 'error' ? 'error' : 'success'}`}>
          {toast.message}
        </div>
      ) : null}

      <section className="employee-hours-grid">
        <article className="employee-hours-card">
          <h3>Today</h3>
          <p>{formatHours(displayWorkingHours.today)}</p>
        </article>
        <article className="employee-hours-card">
          <h3>This Week</h3>
          <p>{formatHours(displayWorkingHours.week)}</p>
        </article>
        <article className="employee-hours-card">
          <h3>This Month</h3>
          <p>{formatHours(displayWorkingHours.month)}</p>
        </article>
      </section>

      <section className="employee-dashboard-panel">
        <TimeTracker
          jobs={jobs}
          selectedJob={selectedJob}
          onSelectJob={setSelectedJob}
          seconds={seconds}
          isWorking={isWorking}
          activeSession={activeSession}
          loading={actionLoading || dashboardLoading}
          onCheckIn={handleStart}
          onCheckOut={handleStop}
        />
      </section>

      <section className="employee-dashboard-panel">
        <CalendarView
          listings={allListings}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onClearDate={() => setSelectedDate(null)}
        />

        <Listings
          approvedListings={approvedListings}
          pendingListings={pendingListings}
          loading={listingsLoading}
          error={listingsError}
          selectedDate={selectedDate}
        />
      </section>

      <section className="employee-dashboard-panel">
        <h2 className="employee-section-title">Time Log History</h2>
        {tableLoading ? (
          <div className="employee-table-loading">Loading entries...</div>
        ) : (
          <TimeEntriesTable
            entries={entries}
            employeeName={employeeName}
            pagination={pagination}
            onPageChange={loadEntries}
            onEdit={setEditingEntry}
          />
        )}
      </section>

      <EditEntryModal
        open={Boolean(editingEntry)}
        entry={editingEntry}
        loading={editLoading}
        onClose={() => setEditingEntry(null)}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
};

export default Dashboard;

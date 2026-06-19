import { useEffect, useMemo, useState } from 'react';
import { getEmployeeListings } from '../api/listings';
import CalendarView from '../components/CalendarView';
import Listings from '../components/Listings';
import './Dashboard.css';

const getMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ListingsPage = () => {
  const [allListings, setAllListings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getEmployeeListings();
      const items = response?.data?.data?.items || [];
      setAllListings(items);
    } catch (err) {
      setError(getMessage(err, 'Failed to load listings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    if (!selectedDate) return allListings;

    const selectedKey = toDateKey(selectedDate);
    return allListings.filter((item) => toDateKey(item.date) === selectedKey);
  }, [allListings, selectedDate]);

  const approvedListings = useMemo(
    () => filteredListings.filter((item) => item.status === 'approved'),
    [filteredListings]
  );

  const pendingListings = useMemo(
    () => filteredListings.filter((item) => item.status !== 'approved'),
    [filteredListings]
  );

  return (
    <div className="employee-dashboard">
      <section>
        <p className="employee-dashboard-overline">Panel</p>
        <h1 className="employee-dashboard-title">Listings</h1>
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
          loading={loading}
          error={error}
          selectedDate={selectedDate}
        />
      </section>
    </div>
  );
};

export default ListingsPage;

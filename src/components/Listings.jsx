const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const Listings = ({ approvedListings, pendingListings, loading, error, selectedDate }) => {
  if (loading) {
    return <div className="employee-listings-loading">Loading listings...</div>;
  }

  if (error) {
    return <div className="employee-listings-error">{error}</div>;
  }

  // Combine both approved and pending listings for the table
  const allListings = [...approvedListings, ...pendingListings];

  return (
    <section className="employee-listings-wrap">
      <div className="employee-listings-head">
        <h2>Listings</h2>
        {selectedDate ? <p>Filtered by selected date</p> : <p>Showing all assigned listings</p>}
      </div>

      <div className="employee-table-shell">
        <div className="employee-table-scroll">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Date</th>
                <th>Work Order #</th>
                <th>Priority</th>
                <th>Work Type</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              {allListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="employee-table-empty">No listings found.</td>
                </tr>
              ) : (
                allListings.map((listing) => {
                  const statusClass = ['approved', 'pending', 'cancelled', 'archived', 'on_hold'].includes(listing.status) ? listing.status : 'pending';
                  return (
                    <tr key={listing.id}>
                      <td style={{ fontWeight: 500 }}>{listing.title}</td>
                      <td>{formatDate(listing.date)}</td>
                      <td>#{listing.basic_details?.job_number || 'N/A'}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {listing.basic_details?.priority || 'normal'}
                        </span>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {listing.basic_details?.work_type?.replace('_', ' ') || 'general'}
                        </span>
                      </td>
                      <td>
                        <span className={`employee-listing-badge ${statusClass}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={listing.basic_details?.description || ''}>
                          {listing.basic_details?.description || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Listings;

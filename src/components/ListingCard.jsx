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

const ListingCard = ({ listing }) => {
  const statusClass = ['approved', 'pending', 'cancelled', 'archived', 'on_hold'].includes(listing.status) ? listing.status : 'pending';

  return (
    <article className="employee-listing-card">
      <div className="employee-listing-card-header">
        <h4>{listing.title}</h4>
        <span className={`employee-listing-badge ${statusClass}`}>{listing.status}</span>
      </div>

      <p className="employee-listing-date">{formatDate(listing.date)}</p>

      <div className="employee-listing-meta">
        <span>#{listing.basic_details?.job_number || 'N/A'}</span>
        <span>{listing.basic_details?.priority || 'normal'} priority</span>
        <span>{listing.basic_details?.work_type || 'general'}</span>
      </div>

      {listing.basic_details?.description ? (
        <p className="employee-listing-description">{listing.basic_details.description}</p>
      ) : null}
    </article>
  );
};

export default ListingCard;

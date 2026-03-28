import { useQuery } from '@tanstack/react-query';
import { getBookItems } from '../api/bookItems';
import { getActiveLendings, getOverdueLendings } from '../api/lending';
import { getActiveListings } from '../api/listings';

const DashboardPage = () => {
  const { data: bookItems = [] } = useQuery({
    queryKey: ['bookItems'],
    queryFn: getBookItems,
  });

  const { data: activeLendings = [] } = useQuery({
    queryKey: ['activeLendings'],
    queryFn: getActiveLendings,
  });

  const { data: overdueLendings = [] } = useQuery({
    queryKey: ['overdueLendings'],
    queryFn: getOverdueLendings,
  });

  const { data: activeListings = [] } = useQuery({
    queryKey: ['activeListings'],
    queryFn: getActiveListings,
  });

  const totalBooks = bookItems.filter((item) => item.status !== 1 && item.status !== 4).length;
  const forSale = activeListings.length;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{totalBooks}</span>
          <span className="stat-label">Books in collection</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{activeLendings.length}</span>
          <span className="stat-label">Currently lent out</span>
        </div>
        <div className={`stat-card ${overdueLendings.length > 0 ? 'stat-card--warning' : ''}`}>
          <span className="stat-number">{overdueLendings.length}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{forSale}</span>
          <span className="stat-label">Listed for sale</span>
        </div>
      </div>

      {overdueLendings.length > 0 && (
        <div className="alert alert--warning">
          <strong>Overdue books</strong>
          <ul>
            {overdueLendings.map((record) => (
              <li key={record.id}>
                {record.bookTitle} — borrowed by {record.borrowerName}
                {record.expectedReturnDate && ` (due ${record.expectedReturnDate})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeLendings.length > 0 && (
        <div className="section">
          <h3>Currently lent out</h3>
          <ul className="lending-list">
            {activeLendings.map((record) => (
              <li key={record.id} className="lending-item">
                <span className="lending-title">{record.bookTitle}</span>
                <span className="lending-borrower">→ {record.borrowerName}</span>
                {record.expectedReturnDate && (
                  <span className="lending-date">Due {record.expectedReturnDate}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
import { useQuery } from "@tanstack/react-query";
import { getBookItems } from "../api/bookItems";
import { getActiveLendings, getOverdueLendings } from "../api/lending";
import { getActiveListings } from "../api/listings";
import { useTranslation } from "react-i18next";

const DashboardPage = () => {
  const { data: bookItems = [], isLoading: loadingBooks } = useQuery({
    queryKey: ['bookItems'],
    queryFn: getBookItems,
});

  const { t } = useTranslation();

  const { data: activeLendings = [], isLoading: loadingLendings } = useQuery({
    queryKey: ["activeLendings"],
    queryFn: getActiveLendings,
  });

  const { data: overdueLendings = [] } = useQuery({
    queryKey: ["overdueLendings"],
    queryFn: getOverdueLendings,
  });

  const { data: activeListings = [] } = useQuery({
    queryKey: ["activeListings"],
    queryFn: getActiveListings,
  });

  if (loadingBooks || loadingLendings) return <div className="loading">{t('loading')}</div>;

  const totalBooks = bookItems.filter(
    (item) => item.status !== 1 && item.status !== 4,
  ).length;
  const forSale = activeListings.length;

  return (
    <div className="dashboard">
      <h2>{t("dashboard")}</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{totalBooks}</span>
          <span className="stat-label">{t("booksInCollection")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{activeLendings.length}</span>
          <span className="stat-label">{t("currentlyLentOut")}</span>
        </div>
        <div
          className={`stat-card ${overdueLendings.length > 0 ? "stat-card--warning" : ""}`}
        >
          <span className="stat-number">{overdueLendings.length}</span>
          <span className="stat-label">{t("overdue")}</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{forSale}</span>
          <span className="stat-label">{t("listedForSale")}</span>
        </div>
      </div>

      {overdueLendings.length > 0 && (
        <div className="alert alert--warning">
          <strong>{t("overdueBooks")}</strong>
          <ul>
            {overdueLendings.map((record) => (
              <li key={record.id}>
                {record.bookTitle} — {record.borrowerName}
                {record.expectedReturnDate &&
                  ` (${t("due")} ${record.expectedReturnDate})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeLendings.length > 0 && (
        <div className="section">
          <h3>{t("currentlyLentOut")}</h3>
          <ul className="lending-list">
            {activeLendings.map((record) => (
              <li key={record.id} className="lending-item">
                <span className="lending-title">{record.bookTitle}</span>
                <span className="lending-borrower">
                  → {record.borrowerName}
                </span>
                {record.expectedReturnDate && (
                  <span className="lending-date">
                    Due {record.expectedReturnDate}
                  </span>
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

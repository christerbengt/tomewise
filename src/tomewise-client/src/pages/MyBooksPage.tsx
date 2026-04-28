import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookItems } from "../api/bookItems";
import BookFilters from "../components/BookFilters";
import type { FilterState } from "../components/BookFilters";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { exportGoodreads } from "../api/books";

const MyBooksPage = () => {
  const { t } = useTranslation();

  const statusLabels: Record<number, string> = {
    0: t("inCollection"),
    1: t("wishlist"),
    2: t("lent"),
    3: t("forSale"),
    4: t("sold"),
  };

  const conditionLabels: Record<number, string> = {
    0: t("conditionNew"),
    1: t("conditionLikeNew"),
    2: t("conditionVeryGood"),
    3: t("conditionGood"),
    4: t("conditionFair"),
    5: t("conditionPoor"),
  };
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    sortBy: "title",
    sortDirection: "asc",
  });
  const navigate = useNavigate();

  const { data: bookItems = [], isLoading } = useQuery({
    queryKey: ["bookItems"],
    queryFn: getBookItems,
  });

  const filtered = bookItems
    .filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !item.bookTitle.toLowerCase().includes(q) &&
          !item.authors.some((a) => a.toLowerCase().includes(q))
        )
          return false;
      }
      if (filters.status !== "") {
        if (item.status !== Number(filters.status)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let valA = "";
      let valB = "";

      switch (filters.sortBy) {
        case "title":
          valA = a.bookTitle;
          valB = b.bookTitle;
          break;
        case "location":
          valA = a.locationDescription ?? "";
          valB = b.locationDescription ?? "";
          break;
        case "acquiredDate":
          valA = a.acquiredDate ?? "";
          valB = b.acquiredDate ?? "";
          break;
        case "estimatedValue":
          return filters.sortDirection === "asc"
            ? (a.estimatedValue ?? 0) - (b.estimatedValue ?? 0)
            : (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0);
        case "author":
          valA = a.authors[0] ?? "";
          valB = b.authors[0] ?? "";
          break;
        case "genre":
          valA = a.genres[0] ?? "";
          valB = b.genres[0] ?? "";
          break;
        default:
          valA = a.bookTitle;
          valB = b.bookTitle;
      }

      return filters.sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  if (isLoading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="my-books">
      <div className="page-header">
        <h2>{t("myBooks")}</h2>
        <div className="header-actions">
          <button className="button-secondary" onClick={exportGoodreads}>
            {t("exportGoodreads")}
          </button>
          <button
            className="button-primary"
            onClick={() => navigate("/add-book")}
          >
            {t("addBook")}
          </button>
        </div>
      </div>

      <BookFilters filters={filters} onChange={setFilters} />

      {filtered.length === 0 && bookItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">{t("emptyBooksTitle")}</p>
          <p className="empty-state-hint">{t("emptyBooksHint")}</p>
          <button
            className="button-primary"
            onClick={() => navigate("/add-book")}
          >
            {t("addBook")}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>{t("noBooksFound")}</p>
        </div>
      ) : (
        <div className="book-list">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="book-card"
              onClick={() => navigate(`/my-books/${item.id}`)}
            >
              <div className="book-cover">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.bookTitle} />
                ) : (
                  <div className="book-cover-placeholder">📖</div>
                )}
              </div>
              <div className="book-info">
                <h3>{item.bookTitle}</h3>
                <div className="book-meta">
                  <span className="meta-tag">
                    {item.locationDescription ?? t("unshelved")}
                  </span>
                  <span className="meta-tag">
                    {conditionLabels[item.condition]}
                  </span>
                  <span className={`meta-tag status-${item.status}`}>
                    {statusLabels[item.status]}
                  </span>
                </div>
                {item.tags.length > 0 && (
                  <div className="book-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooksPage;

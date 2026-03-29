import { useTranslation } from "react-i18next";

export interface FilterState {
  search: string;
  status: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

interface BookFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const BookFilters = ({ filters, onChange }: BookFiltersProps) => {
  const { t } = useTranslation();
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="filter-search"
      />
      <div className="filter-controls">
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">{t("allStatuses")}</option>
          <option value="0">{t("inCollection")}</option>
          <option value="1">{t("wishlist")}</option>
          <option value="2">{t("lent")}</option>
          <option value="3">{t("forSale")}</option>
          <option value="4">{t("sold")}</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
        >
          <option value="title">{t("sortByTitle")}</option>
          <option value="author">{t("sortByAuthor")}</option>
          <option value="genre">{t("sortByGenre")}</option>
          <option value="location">{t("sortByLocation")}</option>
          <option value="acquiredDate">{t("sortByDateAcquired")}</option>
          <option value="estimatedValue">{t("sortByValue")}</option>
        </select>
        <button
          onClick={() =>
            update({
              sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
            })
          }
          className="sort-direction"
        >
          {filters.sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
};

export default BookFilters;

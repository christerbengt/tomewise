

export interface FilterState {
  search: string;
  status: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface BookFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const BookFilters = ({ filters, onChange }: BookFiltersProps) => {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by title, author..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="filter-search"
      />
      <div className="filter-controls">
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="0">In collection</option>
          <option value="1">Wishlist</option>
          <option value="2">Lent</option>
          <option value="3">For sale</option>
          <option value="4">Sold</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
        >
          <option value="title">Sort by title</option>
          <option value="author">Sort by author</option>
          <option value="genre">Sort by genre</option>
          <option value="location">Sort by location</option>
          <option value="acquiredDate">Sort by date acquired</option>
          <option value="estimatedValue">Sort by value</option>
        </select>
        <button
          onClick={() =>
            update({
              sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
            })
          }
          className="sort-direction"
        >
          {filters.sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
};

export default BookFilters;
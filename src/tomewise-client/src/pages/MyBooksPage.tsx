import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBookItems } from '../api/bookItems';
import BookFilters from '../components/BookFilters';
import type { FilterState } from '../components/BookFilters';

const statusLabels: Record<number, string> = {
  0: 'In collection',
  1: 'Wishlist',
  2: 'Lent',
  3: 'For sale',
  4: 'Sold',
};

const conditionLabels: Record<number, string> = {
  0: 'New',
  1: 'Like new',
  2: 'Very good',
  3: 'Good',
  4: 'Fair',
  5: 'Poor',
};

const MyBooksPage = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    sortBy: 'title',
    sortDirection: 'asc',
  });

  const { data: bookItems = [], isLoading } = useQuery({
    queryKey: ['bookItems'],
    queryFn: getBookItems,
  });

  const filtered = bookItems
    .filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!item.bookTitle.toLowerCase().includes(q)) return false;
      }
      if (filters.status !== '') {
        if (item.status !== Number(filters.status)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (filters.sortBy) {
        case 'title':
          valA = a.bookTitle;
          valB = b.bookTitle;
          break;
        case 'location':
          valA = a.locationDescription ?? '';
          valB = b.locationDescription ?? '';
          break;
        case 'acquiredDate':
          valA = a.acquiredDate ?? '';
          valB = b.acquiredDate ?? '';
          break;
        case 'estimatedValue':
          return filters.sortDirection === 'asc'
            ? (a.estimatedValue ?? 0) - (b.estimatedValue ?? 0)
            : (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0);
        default:
          valA = a.bookTitle;
          valB = b.bookTitle;
      }

      return filters.sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  if (isLoading) return <div className="loading">Loading your books...</div>;

  return (
    <div className="my-books">
      <div className="page-header">
        <h2>My Books</h2>
        <button className="button-primary">+ Add book</button>
      </div>

      <BookFilters filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No books found.</p>
        </div>
      ) : (
        <div className="book-list">
          {filtered.map((item) => (
            <div key={item.id} className="book-card">
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
                  {item.locationDescription && (
                    <span className="meta-tag">{item.locationDescription}</span>
                  )}
                  <span className="meta-tag">{conditionLabels[item.condition]}</span>
                  <span className={`meta-tag status-${item.status}`}>
                    {statusLabels[item.status]}
                  </span>
                </div>
                {item.tags.length > 0 && (
                  <div className="book-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
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
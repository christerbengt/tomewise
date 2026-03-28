import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLendingRecords, returnBook } from '../api/lending';

const LendingPage = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['lendingRecords'],
    queryFn: getLendingRecords,
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, returnedDate }: { id: string; returnedDate: string }) =>
      returnBook(id, returnedDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lendingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['activeLendings'] });
      queryClient.invalidateQueries({ queryKey: ['overdueLendings'] });
      queryClient.invalidateQueries({ queryKey: ['bookItems'] });
    },
    onError: () => {
      setError('Failed to return book');
    },
  });

  const handleReturn = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    returnMutation.mutate({ id, returnedDate: today });
  };

  const active = records.filter((r) => !r.returnedDate);
  const returned = records.filter((r) => r.returnedDate);

  if (isLoading) return <div className="loading">Loading lending records...</div>;

  return (
    <div className="lending-page">
      <div className="page-header">
        <h2>Lending</h2>
      </div>

      {error && <p className="error">{error}</p>}

      {active.length === 0 && returned.length === 0 ? (
        <div className="empty-state">
          <p>No lending records yet.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="section">
              <h3>Currently lent out ({active.length})</h3>
              <div className="lending-records">
                {active.map((record) => (
                  <div
                    key={record.id}
                    className={`lending-record ${record.isOverdue ? 'lending-record--overdue' : ''}`}
                  >
                    <div className="lending-record-info">
                      <span className="lending-record-title">{record.bookTitle}</span>
                      <span className="lending-record-borrower">
                        {record.borrowerName}
                        {record.borrowerContact && ` — ${record.borrowerContact}`}
                      </span>
                      <span className="lending-record-dates">
                        Lent {record.lentDate}
                        {record.expectedReturnDate && ` · Due ${record.expectedReturnDate}`}
                      </span>
                      {record.isOverdue && (
                        <span className="overdue-badge">Overdue</span>
                      )}
                    </div>
                    <button
                      className="button-primary"
                      onClick={() => handleReturn(record.id)}
                      disabled={returnMutation.isPending}
                    >
                      Return
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {returned.length > 0 && (
            <div className="section">
              <h3>Returned ({returned.length})</h3>
              <div className="lending-records">
                {returned.map((record) => (
                  <div key={record.id} className="lending-record lending-record--returned">
                    <div className="lending-record-info">
                      <span className="lending-record-title">{record.bookTitle}</span>
                      <span className="lending-record-borrower">{record.borrowerName}</span>
                      <span className="lending-record-dates">
                        Returned {record.returnedDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LendingPage;
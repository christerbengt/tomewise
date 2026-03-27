export interface LendingRecord {
  id: string;
  bookItemId: string;
  bookTitle: string;
  coverImageUrl: string | null;
  borrowerName: string;
  borrowerContact: string | null;
  lentDate: string;
  expectedReturnDate: string | null;
  returnedDate: string | null;
  isOverdue: boolean;
}
export interface BookItem {
  id: string;
  bookId: string;
  bookTitle: string;
  coverImageUrl: string | null;
  condition: number;
  status: number;
  source: number;
  acquiredDate: string | null;
  acquiredPrice: number | null;
  estimatedValue: number | null;
  locationId: string | null;
  locationDescription: string | null;
  userCoverImagePath: string | null;
  notes: string | null;
  tags: string[];
}

export interface Location {
  id: string;
  bookCase: string;
  shelfNumber: number;
  customCode: string | null;
  description: string | null;
  bookCount: number;
}
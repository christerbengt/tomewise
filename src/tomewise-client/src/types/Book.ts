export interface Book {
  id: string;
  title: string;
  isbn10: string | null;
  isbn13: string | null;
  coverImageUrl: string | null;
  publishedYear: number | null;
  publisher: string | null;
  language: string | null;
  pageCount: number | null;
  authors: string[];
  genres: string[];
}
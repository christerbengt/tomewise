export interface Listing {
  id: string;
  bookItemId: string;
  bookTitle: string;
  coverImageUrl: string | null;
  askingPrice: number;
  soldPrice: number | null;
  listedDate: string;
  soldDate: string | null;
  platform: number;
  status: number;
  description: string | null;
}
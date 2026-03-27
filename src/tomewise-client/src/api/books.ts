import apiClient from './client';
import type { Book, IsbnLookupResult } from '../types';

export const getBooks = async (): Promise<Book[]> => {
  const { data } = await apiClient.get<Book[]>('/books');
  return data;
};

export const getBook = async (id: string): Promise<Book> => {
  const { data } = await apiClient.get<Book>(`/books/${id}`);
  return data;
};

export const createBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
  const { data } = await apiClient.post<Book>('/books', book);
  return data;
};

export const updateBook = async (id: string, book: Omit<Book, 'id'>): Promise<void> => {
  await apiClient.put(`/books/${id}`, book);
};

export const deleteBook = async (id: string): Promise<void> => {
  await apiClient.delete(`/books/${id}`);
};

export const lookupIsbn = async (isbn: string): Promise<IsbnLookupResult> => {
  const { data } = await apiClient.get<IsbnLookupResult>(`/isbn/${isbn}`);
  return data;
};
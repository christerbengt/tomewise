import apiClient from './client';
import type { BookItem } from '../types';

export const getBookItems = async (): Promise<BookItem[]> => {
  const { data } = await apiClient.get<BookItem[]>('/bookitems');
  return data;
};

export const getBookItem = async (id: string): Promise<BookItem> => {
  const { data } = await apiClient.get<BookItem>(`/bookitems/${id}`);
  return data;
};

export const createBookItem = async (
  bookItem: Omit<BookItem, 'id' | 'bookTitle' | 'coverImageUrl' | 'locationDescription' | 'source'>
): Promise<BookItem> => {
  const { data } = await apiClient.post<BookItem>('/bookitems', bookItem);
  return data;
};

export const updateBookItem = async (
  id: string,
  bookItem: Omit<BookItem, 'id' | 'bookId' | 'bookTitle' | 'coverImageUrl' | 'locationDescription' | 'source'>
): Promise<void> => {
  await apiClient.put(`/bookitems/${id}`, bookItem);
};

export const deleteBookItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/bookitems/${id}`);
};
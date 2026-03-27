import apiClient from './client';
import type { LendingRecord } from '../types';

export const getLendingRecords = async (): Promise<LendingRecord[]> => {
  const { data } = await apiClient.get<LendingRecord[]>('/lending');
  return data;
};

export const getActiveLendings = async (): Promise<LendingRecord[]> => {
  const { data } = await apiClient.get<LendingRecord[]>('/lending/active');
  return data;
};

export const getOverdueLendings = async (): Promise<LendingRecord[]> => {
  const { data } = await apiClient.get<LendingRecord[]>('/lending/overdue');
  return data;
};

export const lendBook = async (request: {
  bookItemId: string;
  borrowerName: string;
  borrowerContact: string | null;
  lentDate: string;
  expectedReturnDate: string | null;
}): Promise<LendingRecord> => {
  const { data } = await apiClient.post<LendingRecord>('/lending', request);
  return data;
};

export const returnBook = async (
  id: string,
  returnedDate: string
): Promise<void> => {
  await apiClient.put(`/lending/${id}/return`, { returnedDate });
};
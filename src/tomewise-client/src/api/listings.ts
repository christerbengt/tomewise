import apiClient from './client';
import type { Listing } from '../types';

export const getListings = async (): Promise<Listing[]> => {
  const { data } = await apiClient.get<Listing[]>('/listings');
  return data;
};

export const getActiveListings = async (): Promise<Listing[]> => {
  const { data } = await apiClient.get<Listing[]>('/listings/active');
  return data;
};

export const getListing = async (id: string): Promise<Listing> => {
  const { data } = await apiClient.get<Listing>(`/listings/${id}`);
  return data;
};

export const createListing = async (request: {
  bookItemId: string;
  askingPrice: number;
  listedDate: string;
  platform: number;
  description: string | null;
}): Promise<Listing> => {
  const { data } = await apiClient.post<Listing>('/listings', request);
  return data;
};

export const updateListing = async (
  id: string,
  request: {
    askingPrice: number;
    platform: number;
    description: string | null;
  }
): Promise<void> => {
  await apiClient.put(`/listings/${id}`, request);
};

export const markAsSold = async (
  id: string,
  request: {
    soldPrice: number;
    soldDate: string;
  }
): Promise<void> => {
  await apiClient.put(`/listings/${id}/sold`, request);
};

export const cancelListing = async (id: string): Promise<void> => {
  await apiClient.put(`/listings/${id}/cancel`, {});
};
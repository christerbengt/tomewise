import apiClient from './client';
import type { Location } from '../types';

export const getLocations = async (): Promise<Location[]> => {
  const { data } = await apiClient.get<Location[]>('/locations');
  return data;
};

export const getLocation = async (id: string): Promise<Location> => {
  const { data } = await apiClient.get<Location>(`/locations/${id}`);
  return data;
};

export const createLocation = async (
  location: Omit<Location, 'id' | 'bookCount'>
): Promise<Location> => {
  const { data } = await apiClient.post<Location>('/locations', location);
  return data;
};

export const updateLocation = async (
  id: string,
  location: Omit<Location, 'id' | 'bookCount'>
): Promise<void> => {
  await apiClient.put(`/locations/${id}`, location);
};

export const deleteLocation = async (id: string): Promise<void> => {
  await apiClient.delete(`/locations/${id}`);
};
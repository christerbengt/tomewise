import apiClient from './client';

export interface UserProfile {
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdDate: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get<UserProfile>('/profile');
  return data;
};

export const updateProfile = async (request: {
  firstName: string | null;
  lastName: string | null;
}): Promise<void> => {
  await apiClient.put('/profile', request);
};

export const changePassword = async (request: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiClient.post('/profile/change-password', request);
};
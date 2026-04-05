export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdDate: string;
  isDisabled: boolean;
  bookCount: number;
}
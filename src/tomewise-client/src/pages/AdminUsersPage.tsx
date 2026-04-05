import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";
import type { UserResponseDto } from "../types/UserResponseDto";

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponseDto[]>("/admin/users");
      return data;
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/users/${id}/disable`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: () => setError("Failed to disable user"),
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/users/${id}/enable`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: () => setError("Failed to enable user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: () => setError("Failed to delete user"),
  });

  const handleDelete = (id: string, email: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${email}? This cannot be undone.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Users</h2>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="admin-table">
        <div className="admin-table-header">
          <span>Email</span>
          <span>Name</span>
          <span>Registered</span>
          <span>Books</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {users.map((user) => (
          <div
            key={user.id}
            className={`admin-table-row ${user.isDisabled ? "admin-table-row--disabled" : ""}`}
          >
            <span className="admin-cell-email">{user.email}</span>
            <span>
              {user.firstName} {user.lastName}
            </span>
            <span>{user.createdDate}</span>
            <span>{user.bookCount}</span>
            <span>
              {user.isDisabled ? (
                <span className="status-badge status-badge--disabled">
                  Disabled
                </span>
              ) : (
                <span className="status-badge status-badge--active">
                  Active
                </span>
              )}
            </span>
            <div className="admin-actions">
              {user.isDisabled ? (
                <button
                  className="button-secondary"
                  onClick={() => enableMutation.mutate(user.id)}
                  disabled={enableMutation.isPending}
                >
                  Enable
                </button>
              ) : (
                <button
                  className="button-secondary"
                  onClick={() => disableMutation.mutate(user.id)}
                  disabled={disableMutation.isPending}
                >
                  Disable
                </button>
              )}
              <button
                className="button-danger"
                onClick={() => handleDelete(user.id, user.email)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;

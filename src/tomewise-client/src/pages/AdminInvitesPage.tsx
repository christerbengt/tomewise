import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

interface InviteResponse {
  id: string;
  code: string;
  inviteUrl: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  isUsed: boolean;
  isValid: boolean;
  usedByEmail: string | null;
}

const AdminInvitesPage = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['adminInvites'],
    queryFn: async () => {
      const { data } = await apiClient.get<InviteResponse[]>('/admin/invites');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/invites'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminInvites'] }),
    onError: () => setError('Failed to create invite'),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/invites/${id}/revoke`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminInvites'] }),
    onError: () => setError('Failed to revoke invite'),
  });

  const handleCopy = async (invite: InviteResponse) => {
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('sv-SE');

  if (isLoading) return <div className="loading">Loading invites...</div>;

  const active = invites.filter(i => i.isValid);
  const inactive = invites.filter(i => !i.isValid);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Invites</h2>
        <button
          className="button-primary"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : '+ Generate invite'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {active.length > 0 && (
        <div className="section">
          <h3>Active ({active.length})</h3>
          <div className="invite-list">
            {active.map((invite) => (
              <div key={invite.id} className="invite-card">
                <div className="invite-info">
                  <span className="invite-code">{invite.code}</span>
                  <span className="invite-expiry">Expires {formatDate(invite.expiresAt)}</span>
                </div>
                <div className="invite-actions">
                  <button
                    className="button-secondary"
                    onClick={() => handleCopy(invite)}
                  >
                    {copiedId === invite.id ? '✓ Copied' : 'Copy link'}
                  </button>
                  <button
                    className="button-danger"
                    onClick={() => revokeMutation.mutate(invite.id)}
                    disabled={revokeMutation.isPending}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div className="section">
          <h3>Inactive ({inactive.length})</h3>
          <div className="invite-list">
            {inactive.map((invite) => (
              <div key={invite.id} className="invite-card invite-card--inactive">
                <div className="invite-info">
                  <span className="invite-code">{invite.code}</span>
                  <span className="invite-status">
                    {invite.isRevoked ? 'Revoked' : invite.isUsed ? `Used by ${invite.usedByEmail}` : 'Expired'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invites.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No invites yet</p>
          <p className="empty-state-hint">Generate an invite link to share with your beta testers.</p>
        </div>
      )}
    </div>
  );
};

export default AdminInvitesPage;
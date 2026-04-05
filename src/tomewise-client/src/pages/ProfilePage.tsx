import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../api/profile';
import { useTranslation } from 'react-i18next';

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 8) errors.push('passwordTooShort');
  if (!/[A-Z]/.test(password)) errors.push('passwordNeedsUppercase');
  if (!/[0-9]/.test(password)) errors.push('passwordNeedsNumber');
  return errors;
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const newPasswordErrors = validatePassword(newPassword);
  const newPasswordValid = newPasswordErrors.length === 0;

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordTouched(false);
      setPasswordSuccess(true);
      setPasswordError(null);
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: () => {
      setPasswordError(t('currentPasswordIncorrect'));
    },
  });

  const handleProfileSubmit = () => {
    updateMutation.mutate({
      firstName: firstName || null,
      lastName: lastName || null,
    });
  };

  const handlePasswordSubmit = () => {
    if (!newPasswordValid) return;
    setPasswordError(null);
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) return <div className="loading">{t('loading')}</div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>{t('profile')}</h2>
      </div>

      <div className="profile-section">
        <h3>{t('accountInfo')}</h3>
        <div className="profile-card">
          <div className="detail-row">
            <span className="detail-label">{t('email')}</span>
            <span className="detail-value">{profile.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('dateAcquired')}</span>
            <span className="detail-value">{profile.createdDate}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t('personalInfo')}</h3>
        <div className="profile-card">
          <div className="form-group">
            <label htmlFor="firstName">{t('firstName')}</label>
            <input
              id="firstName"
              type="text"
              defaultValue={profile.firstName ?? ''}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">{t('lastName')}</label>
            <input
              id="lastName"
              type="text"
              defaultValue={profile.lastName ?? ''}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          {profileSuccess && <p className="success-message">{t('profileUpdated')}</p>}
          <button
            className="button-primary"
            onClick={handleProfileSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t('changePassword')}</h3>
        <div className="profile-card">
          <div className="form-group">
            <label htmlFor="currentPassword">{t('currentPassword')}</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">{t('newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setNewPasswordTouched(true)}
            />
            {newPasswordTouched && newPasswordErrors.length > 0 && (
              <ul className="password-requirements">
                {newPasswordErrors.map((err) => (
                  <li key={err} className="requirement-error">{t(err)}</li>
                ))}
              </ul>
            )}
            {newPasswordTouched && newPasswordValid && (
              <p className="password-valid">✓</p>
            )}
          </div>
          {passwordError && <p className="error">{passwordError}</p>}
          {passwordSuccess && <p className="success-message">{t('passwordChanged')}</p>}
          <button
            className="button-primary"
            onClick={handlePasswordSubmit}
            disabled={!currentPassword || !newPasswordValid || passwordMutation.isPending}
          >
            {passwordMutation.isPending ? t('saving') : t('changePassword')}
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t('subscriptionStatus')}</h3>
        <div className="profile-card">
          <div className="subscription-badge">
            <span className="subscription-label">{t('betaUser')}</span>
          </div>
          <p className="subscription-message">{t('betaMessage')}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t('deleteAccount')}</h3>
        <div className="profile-card profile-card--danger">
          <p className="delete-account-message">{t('deleteAccountMessage')}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
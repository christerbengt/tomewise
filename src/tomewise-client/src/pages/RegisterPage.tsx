import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../api/auth";
import { useTranslation } from "react-i18next";

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 8) errors.push('passwordTooShort');
  if (!/[A-Z]/.test(password)) errors.push('passwordNeedsUppercase');
  if (!/[0-9]/.test(password)) errors.push('passwordNeedsNumber');
  return errors;
};

const RegisterPage = () => {
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordErrors = validatePassword(password);
  const passwordValid = passwordErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) return;
    setError(null);
    setLoading(true);
    try {
      const response = await register(email, password, firstName, lastName);
      authLogin(response.token);
      navigate("/dashboard");
    } catch {
      setError(t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Tomewise</h1>
      <h2>{t("register")}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">{t("firstName")}</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">{t("lastName")}</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">{t("email")}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t("password")}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            required
          />
          {passwordTouched && passwordErrors.length > 0 && (
            <ul className="password-requirements">
              {passwordErrors.map((err) => (
                <li key={err} className="requirement-error">
                  {t(err)}
                </li>
              ))}
            </ul>
          )}
          {!passwordTouched && (
            <p className="password-hint">{t("passwordRequirements")}</p>
          )}
          {passwordTouched && passwordValid && (
            <p className="password-valid">✓</p>
          )}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || !passwordValid}>
          {loading ? t("registering") : t("register")}
        </button>
      </form>
      <p>{t("haveAccount")} <Link to="/login">{t("signIn")}</Link></p>
    </div>
  );
};

export default RegisterPage;

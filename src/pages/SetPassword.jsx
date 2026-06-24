import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import './SetPassword.css';

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isPasswordSet, setIsPasswordSet] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email) {
      nextErrors.email = 'Missing email in setup link.';
    }

    if (!token) {
      nextErrors.token = 'Missing token in setup link.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/employee/set-password', {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setIsPasswordSet(true);
      setApiError('');
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to set password.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-set-password-page">
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>
      <div className="employee-set-password-card animate-fade-in-up">
        <h1 className="employee-set-password-title">Set Your Password</h1>
        <p className="employee-set-password-subtitle">
          Create a password for your employee account.
        </p>

        {email ? <p className="employee-set-password-email">{email}</p> : null}
        {apiError ? <div className="employee-set-password-alert">{apiError}</div> : null}

        {(errors.email || errors.token) ? (
          <div className="employee-set-password-alert">
            {errors.email || errors.token}
          </div>
        ) : null}

        {isPasswordSet ? (
          <div className="employee-set-password-success">
            <p className="employee-set-password-success-text">
              Password set successfully.
            </p>
            <button
              type="button"
              className="employee-set-password-button"
              onClick={() => navigate('/login?passwordSet=1', { replace: true })}
            >
              Go to Login
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="employee-set-password-form" noValidate>
          <label className="employee-set-password-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`employee-set-password-input ${errors.password ? 'has-error' : ''}`}
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={validate}
          />
          {errors.password ? (
            <span className="employee-set-password-error">{errors.password}</span>
          ) : null}

          <label className="employee-set-password-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`employee-set-password-input ${errors.confirmPassword ? 'has-error' : ''}`}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={validate}
          />
          {errors.confirmPassword ? (
            <span className="employee-set-password-error">{errors.confirmPassword}</span>
          ) : null}

          <button
            type="submit"
            className="employee-set-password-button"
            disabled={loading || !email || !token || isPasswordSet}
          >
            {loading ? 'Setting password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;

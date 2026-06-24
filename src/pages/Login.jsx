import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('passwordSet') === '1') {
      setSuccessMessage('Password set successfully. Please log in.');
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authToken = params.get('authToken');
    if (!authToken) return;
    localStorage.setItem('employee_token', authToken);
    navigate('/time-tracking', { replace: true });
  }, [location.search, navigate]);

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
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
      const response = await api.post('/employee/login', { email: email.trim(), password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = response?.data?.data?.token;
      const employee = response?.data?.data?.employee || {};
      if (!token) throw new Error('Token not found in login response.');
      localStorage.setItem('employee_token', token);
      localStorage.setItem('employee_auth_employee', JSON.stringify(employee));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Employee login failed.';
      if (message === 'Please set your password first') {
        navigate(`/set-password?email=${encodeURIComponent(email)}`, { replace: true });
        return;
      }
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-page">
      <div className="employee-login-card animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          
            <a
            href="https://trakjobs.com"
            onClick={(e) => { e.preventDefault(); window.location.href = 'https://trakjobs.com'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', height: '44px', width: '44px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: '#fff3cd', color: '#0F2744' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12V22H22V12L12 2Z" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ lineHeight: 1, paddingTop: '4px', textAlign: 'left' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#0F2744', fontFamily: 'Poppins, sans-serif' }}>
                Trak<span style={{ color: '#ffb800' }}>Jobs</span>
              </span>
              <div style={{ marginTop: '2px', fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Fix it. Right. On time.
              </div>
            </div>
          </a>
        </div>
        <h1 className="employee-login-title">Employee Login</h1>
        <p className="employee-login-subtitle">Sign in to access your employee dashboard.</p>

        {successMessage ? <div className="employee-login-success">{successMessage}</div> : null}
        {apiError ? <div className="employee-login-alert">{apiError}</div> : null}

        <form onSubmit={handleSubmit} className="employee-login-form" noValidate>
          <label className="employee-login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`employee-login-input ${errors.email ? 'has-error' : ''}`}
            placeholder="Enter email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={validate}
          />
          {errors.email ? <span className="employee-login-error">{errors.email}</span> : null}

          <label className="employee-login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={`employee-login-input ${errors.password ? 'has-error' : ''}`}
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={validate}
          />
          {errors.password ? <span className="employee-login-error">{errors.password}</span> : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 8px' }}>
            <a
              href="/forgot-password"
              onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
              style={{ fontSize: '13px', color: '#3574bb', textDecoration: 'none', fontWeight: 500 }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="employee-login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

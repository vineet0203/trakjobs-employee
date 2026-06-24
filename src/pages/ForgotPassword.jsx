import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) { setError('Email is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/employee/forgot-password', { email: email.trim() }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess('If an account exists with this email, you will receive a password reset link shortly.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to request password reset.');
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
        <h1 className="employee-login-title">Forgot Password</h1>
        <p className="employee-login-subtitle">Enter your email and we will send you a password reset link.</p>

        {success ? <div className="employee-login-success">{success}</div> : null}
        {error ? <div className="employee-login-alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="employee-login-form" noValidate>
          <label className="employee-login-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={`employee-login-input ${error ? 'has-error' : ''}`}
            placeholder="Enter email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="employee-login-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

import { useNavigate } from 'react-router-dom';
import './VerificationRequired.css';

export default function VerificationRequired() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_auth_employee');
    navigate('/login', { replace: true });
  };

  return (
    <div className="verification-required-container">
      <div className="verification-required-card">
        <div className="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lock-icon">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="title">Account Verification Required</h1>
        
        <p className="description">
          Your account is not verified yet. Please complete the verification process to unlock your time tracking dashboard.
        </p>

        <div className="button-group">
          <button
            onClick={() => navigate('/verification')}
            className="verify-btn"
          >
            Verify My Account
          </button>

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const employee = useMemo(() => {
    try {
      const raw = localStorage.getItem('employee_auth_employee');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const displayName = useMemo(() => {
    if (employee?.name) return employee.name;
    if (employee?.full_name) return employee.full_name;
    if (employee?.first_name && employee?.last_name) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    if (employee?.first_name) return employee.first_name;
    if (employee?.email) {
      return employee.email
        .split('@')[0]
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return 'Employee';
  }, [employee]);

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .map((chunk) => chunk[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

  const handleLogout = () => {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_auth_employee');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="employee-layout">
      <Sidebar />

      <div className="employee-layout-main">
        <header className="employee-layout-header">
          <div className="employee-layout-header-right">
            <div className="employee-profile-container" ref={dropdownRef}>
              <button
                type="button"
                className="employee-profile-pill"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span className="employee-profile-avatar">{initials}</span>
                <span className="employee-profile-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {displayName}
                  {employee?.verification_status === 'verified' ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px', color: '#22c55e', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg 
                      style={{ width: '14px', height: '14px', color: '#f59e0b', cursor: 'pointer', flexShrink: 0 }}
                      className="animate-pulse"
                      onClick={(e) => {
                        e.stopPropagation();
                        const token = localStorage.getItem('employee_token');
                        const vendorAppUrl = import.meta.env.VITE_VENDOR_APP_URL || 'http://localhost:5173';
                        window.location.href = `${vendorAppUrl}/verification?authToken=${token}&role=Employee`;
                      }}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      title="Account verification required. Click to verify."
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="employee-profile-dropdown">
                  <div className="employee-dropdown-header">
                    <span className="employee-dropdown-name">{displayName}</span>
                    <span className="employee-dropdown-email">{employee?.email || ''}</span>
                  </div>
                  <button
                    type="button"
                    className="employee-dropdown-logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="employee-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

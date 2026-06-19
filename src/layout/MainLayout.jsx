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
                <span className="employee-profile-name">{displayName}</span>
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

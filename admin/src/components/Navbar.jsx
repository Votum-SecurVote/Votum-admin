import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiEye, FiShield, FiLogIn, FiLogOut, FiLock, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 3px solid var(--brand-navy, #1e293b);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const LogoMain = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
`;

const LogoSub = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const NavLinks = styled.div`
  display: flex;
  height: 100%;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1.25rem;
  height: 72px;
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-bottom: 4px solid transparent;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: #f8fafc;
    color: #0f172a;
  }
  
  &.active {
    color: #1e40af; /* Formal Blue */
    background: #eff6ff;
    border-bottom: 4px solid #1e40af;
    font-weight: 700;
  }

  ${props => props.$disabled && `
    color: #cbd5e1;
    cursor: not-allowed;
    &:hover { background: transparent; }
  `}
`;

const AuthButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border: 2px solid #1e293b;
  background: ${props => props.$isAdmin ? 'transparent' : '#1e293b'};
  color: ${props => props.$isAdmin ? '#1e293b' : 'white'};
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${props => props.$isAdmin ? '#f1f5f9' : '#0f172a'};
  }
`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/election/create', icon: <FiPlus />, label: 'Create Election' },
    { to: '/admin/ballot/design', icon: <FiEdit />, label: 'Ballot Management' },
    { to: '/admin/election/view', icon: <FiEye />, label: 'Audit / View' },
    { to: '/admin/voters/approval', icon: <FiShield />, label: 'Voter Registry' },
  ];

  const handleAuth = () => {
    if (isAdmin) {
      logout();
      navigate('/login', { replace: true });
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <Nav>
        <NavContent>
          <LogoContainer onClick={() => navigate('/elections/public')}>
            <LogoMain>VOTUM</LogoMain>
            <LogoSub>Admin</LogoSub>
          </LogoContainer>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '100%' }}>
            <NavLinks>
              {navItems.map((item) => {
                const disabled = !isAdmin;
                const active = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={disabled ? '#' : item.to}
                    className={active ? 'active' : ''}
                    $disabled={disabled}
                    aria-disabled={disabled}
                  >
                    {disabled ? <FiLock size={14} /> : item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </NavLinks>

            <AuthButton $isAdmin={isAdmin} onClick={handleAuth}>
              {isAdmin ? (
                <>
                  <FiLogOut />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <FiLogIn />
                  <span>Secure Sign In</span>
                </>
              )}
            </AuthButton>
          </div>
        </NavContent>
      </Nav>
    </>
  );
};

export default Navbar;
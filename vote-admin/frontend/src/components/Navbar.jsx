import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiEye, FiLogIn, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

// Fixed top nav bar shared by admin + public views
const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  backdrop-filter: none;
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0 2rem;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-navy);
  cursor: pointer;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-normal);
  position: relative;
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  &.active {
    color: var(--primary);
    background: rgba(37, 99, 235, 0.08);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 1rem;
      right: 1rem;
      height: 2px;
      background: var(--primary);
      border-radius: 1px;
    }
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: -2.25rem;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: #0f172a;
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  box-shadow: var(--shadow-sm);
`;

const AuthButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }
`;

// Navbar – shows brand, "Create / Ballot / View" tabs
// and Login / Logout button based on admin auth status.
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const navItems = [
    { to: '/admin/election/create', icon: <FiPlus />, label: 'Create', admin: true },
    { to: '/admin/ballot/design', icon: <FiEdit />, label: 'Ballot', admin: true },
    { to: '/admin/election/view', icon: <FiEye />, label: 'View', admin: true },
  ];
  
  const handleAuth = () => {
    if (isAdmin) {
      logout();
      navigate('/elections/public');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <Nav>
      <NavContent>
        <Logo
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/elections/public')}
        >
          SecureVote Admin
        </Logo>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLinks>
            {navItems.map((item) => {
              const disabled = item.admin && !isAdmin;
              const active = location.pathname === item.to;
              return (
                <div key={item.to} style={{ position: 'relative' }}>
                  <NavLink
                    to={item.to}
                    className={active ? 'active' : ''}
                    $disabled={disabled}
                    title={disabled ? 'You do not have permission to perform this action' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                  {disabled && (
                    <Tooltip>
                      You do not have permission to perform this action
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </NavLinks>
          
          <AuthButton onClick={handleAuth}>
            {isAdmin ? (
              <>
                <FiLogOut />
                <span>Logout</span>
              </>
            ) : (
              <>
                <FiLogIn />
                <span>Sign In</span>
              </>
            )}
          </AuthButton>
        </div>
      </NavContent>
    </Nav>
  );
};

export default Navbar;

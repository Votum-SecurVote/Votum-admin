import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock, FiShield, FiAlertTriangle, FiUser, FiKey } from 'react-icons/fi';
import { loginAdmin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Page = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Fixed Viewport */
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  font-family: 'Public Sans', 'Inter', sans-serif;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-top: 6px solid #1e40af; /* Institutional Navy accent */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  display: flex;
  flex-direction: column;
`;

const Branding = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  .agency-name {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
    text-transform: uppercase;
  }
`;

const WarningBox = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 0.75rem;
  
  svg { color: #9a3412; flex-shrink: 0; margin-top: 2px; }
  p {
    margin: 0;
    font-size: 0.75rem;
    color: #9a3412;
    line-height: 1.4;
    font-weight: 600;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: #334155;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    letter-spacing: 0.025em;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1rem;
    color: #94a3b8;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 2px;
  font-size: 1rem;
  color: #0f172a;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e40af;
    background: #f8fafc;
  }
`;

const AuthButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: background 0.2s;

  &:hover:not(:disabled) { background: #1e3a8a; }
  &:disabled { background: #94a3b8; cursor: not-allowed; }
`;

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-left: 4px solid #dc2626;
  color: #991b1b;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await loginAdmin(email, password);
      login({ token, role: "ADMIN" });
      navigate('/admin/election/view');
    } catch (err) {
      setError("AUTHENTICATION FAILED: Invalid credentials provided.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <MainContent>
        <LoginCard>
          <Branding>
            <div className="agency-name">Admin</div>
            <h2>VOTUM</h2>
          </Branding>

          <WarningBox>
            <FiAlertTriangle size={18} />
            <p>
              This is a restricted-access system. By logging in, you acknowledge
              that all activities are logged and subject to audit under
              regional cybersecurity laws.
            </p>
          </WarningBox>

          <form onSubmit={submit}>
            {error && (
              <ErrorBanner>
                <FiLock size={14} /> {error}
              </ErrorBanner>
            )}

            <FormGroup>
              <label htmlFor="email">Administrative ID (Email)</label>
              <InputWrapper>
                <FiUser size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@votum.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <label htmlFor="password">Password</label>
              <InputWrapper>
                <FiKey size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <AuthButton type="submit" disabled={loading}>
              {loading ? (
                'Authenticating Session...'
              ) : (
                <>
                  <FiShield /> Login
                </>
              )}
            </AuthButton>
          </form>
        </LoginCard>
      </MainContent>
    </Page>
  );
};

export default Login;
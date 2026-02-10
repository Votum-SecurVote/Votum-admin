import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loginAdmin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-page);
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 0.95rem;
  color: var(--text-primary);
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
  }
`;

const PrimaryButton = styled.button`
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--primary);
  color: #ffffff;
  cursor: pointer;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    box-shadow: var(--shadow-md);
  }

  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-muted);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ErrorBox = styled.div`
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid rgba(198, 40, 40, 0.3);
  color: var(--danger);
  font-size: 0.85rem;
`;

const Login = () => {
  const [username, setUsername] = useState('');
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
      const data = await loginAdmin(username, password);
      console.log('Login response:', data);
      
      // Update auth context
      login({ token: data.token, role: data.role });
      
      // Redirect to admin dashboard
      navigate('/admin/election/view');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Title>Admin Login</Title>
        <Form onSubmit={submit}>
          {error && <ErrorBox>{error}</ErrorBox>}

          <Field>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </PrimaryButton>
        </Form>
      </Card>
    </Page>
  );
};

export default Login;

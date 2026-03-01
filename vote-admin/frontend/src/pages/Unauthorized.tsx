import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import AnimatedCard from '../components/AnimatedCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 4rem;
  color: var(--warning);
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--primary-hover);
  }
`;

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <AnimatedCard>
        <IconWrapper>
          <FiAlertCircle />
        </IconWrapper>
        <Title>Access Denied</Title>
        <Message>
          You do not have permission to access this page.
          <br />
          Please contact your administrator if you believe this is an error.
        </Message>
        <Button onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Go Back
        </Button>
      </AnimatedCard>
    </Container>
  );
};

export default Unauthorized;

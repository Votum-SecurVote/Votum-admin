import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

/* =========================
   IST → UTC for API
   datetime-local gives "YYYY-MM-DDTHH:mm" with no timezone.
   We interpret it as Asia/Kolkata (IST) and send UTC to backend.
========================= */
const istToUTC = (dateTimeLocalStr) => {
  if (!dateTimeLocalStr) return '';
  const istStr = `${dateTimeLocalStr}:00+05:30`;
  return new Date(istStr).toISOString();
};

/* =========================
   STYLES
========================= */
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-page);
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--field-bg);
  color: var(--text-primary);
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
    background: #ffffff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  min-height: 120px;
  background: var(--field-bg);
  color: var(--text-primary);
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
    background: #ffffff;
  }
`;

const Button = styled(motion.button)`
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: var(--primary);
  color: white;
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, var(--success), #059669);
  color: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
`;

const ElectionCreate = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [electionId, setElectionId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    votingRules: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: istToUTC(formData.startDate),
        endDate: istToUTC(formData.endDate),
        votingRules: formData.votingRules
      };

      const res = await electionService.createElection(payload);
      const created = res.data;

      localStorage.setItem('lastElectionId', created._id);
      setElectionId(created._id);
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/admin/ballot/design';
      }, 1200);

    } catch (err) {
      alert(err.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Creating election..." />;

  if (success) {
    return (
      <PageContainer>
        <SuccessMessage>
          <FiCheck size={48} />
          <h3>Election Created Successfully</h3>
          <p>ID: {electionId}</p>
          <p>Redirecting to Ballot Designer...</p>
        </SuccessMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AnimatedCard>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Election Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea name="description" value={formData.description} onChange={handleChange} />
          </FormGroup>

          <FormGroup>
            <Label><FiCalendar /> Start Date (IST)</Label>
            <Input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label><FiClock /> End Date (IST)</Label>
            <Input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Voting Rules</Label>
            <TextArea name="votingRules" value={formData.votingRules} onChange={handleChange} />
          </FormGroup>

          <Button type="submit">
            Create Election <FiArrowRight />
          </Button>
        </Form>
      </AnimatedCard>
    </PageContainer>
  );
};

export default ElectionCreate;

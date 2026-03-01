import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

// Zod schema for validation
const electionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  electionType: z.enum(['GENERAL', 'PRESIDENTIAL', 'LOCAL', 'REFERENDUM'], {
    errorMap: () => ({ message: 'Please select a valid election type' }),
  }),
  votingRules: z.string().max(500, 'Voting rules must be less than 500 characters').optional().or(z.literal('')),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ElectionFormData = z.infer<typeof electionSchema>;

// IST to UTC conversion
const istToUTC = (dateTimeLocalStr: string): string => {
  if (!dateTimeLocalStr) return '';
  const istStr = `${dateTimeLocalStr}:00+05:30`;
  return new Date(istStr).toISOString();
};

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid ${props => (props.hasError ? 'var(--danger)' : 'var(--border-color)')};
  font-size: 0.95rem;
  transition: border-color var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid ${props => (props.hasError ? 'var(--danger)' : 'var(--border-color)')};
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid ${props => (props.hasError ? 'var(--danger)' : 'var(--border-color)')};
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ErrorMessage = styled.span`
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: -0.25rem;
`;

const Button = styled(motion.button)`
  padding: 0.875rem 2rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ElectionCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [electionId, setElectionId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ElectionFormData>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      electionType: 'GENERAL',
      votingRules: '',
    },
  });

  const onSubmit = async (data: ElectionFormData) => {
    try {
      setLoading(true);
      const payload = {
        title: data.title,
        description: data.description || '',
        startDate: istToUTC(data.startDate),
        endDate: istToUTC(data.endDate),
        electionType: data.electionType,
        votingRules: data.votingRules || '',
      };

      const response = await electionService.createElection(payload);
      const createdElectionId = response.data?._id || response.data?.id;

      if (createdElectionId) {
        localStorage.setItem('lastElectionId', createdElectionId);
        setElectionId(createdElectionId);
        setSuccess(true);
        reset();

        setTimeout(() => {
          window.location.href = '/admin/ballot/design';
        }, 1200);
      }
    } catch (error: any) {
      console.error('Election creation failed:', error);
      alert(error?.response?.data?.message || error?.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <AnimatedCard>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Create New Election
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Fill in the details to create a new election
        </p>

        {success && electionId && (
          <div
            style={{
              padding: '1rem',
              background: 'var(--success)15',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              color: 'var(--success)',
            }}
          >
            <strong>Election Created Successfully!</strong>
            <br />
            Election ID: {electionId}
            <br />
            <small>Redirecting to Ballot Designer...</small>
          </div>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>
              <FiCalendar />
              Election Title *
            </Label>
            <Input
              type="text"
              placeholder="Enter election title"
              {...register('title')}
              hasError={!!errors.title}
            />
            {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              placeholder="Enter election description (optional)"
              {...register('description')}
              hasError={!!errors.description}
            />
            {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FiClock />
              Start Date (IST) *
            </Label>
            <Input
              type="datetime-local"
              {...register('startDate')}
              hasError={!!errors.startDate}
            />
            {errors.startDate && <ErrorMessage>{errors.startDate.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FiClock />
              End Date (IST) *
            </Label>
            <Input
              type="datetime-local"
              {...register('endDate')}
              hasError={!!errors.endDate}
            />
            {errors.endDate && <ErrorMessage>{errors.endDate.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Election Type *</Label>
            <Select {...register('electionType')} hasError={!!errors.electionType}>
              <option value="GENERAL">General Election</option>
              <option value="PRESIDENTIAL">Presidential Election</option>
              <option value="LOCAL">Local Election</option>
              <option value="REFERENDUM">Referendum</option>
            </Select>
            {errors.electionType && <ErrorMessage>{errors.electionType.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Voting Rules</Label>
            <TextArea
              placeholder="Enter voting rules (optional)"
              {...register('votingRules')}
              hasError={!!errors.votingRules}
            />
            {errors.votingRules && <ErrorMessage>{errors.votingRules.message}</ErrorMessage>}
          </FormGroup>

          <Button type="submit" disabled={isSubmitting || loading}>
            {loading || isSubmitting ? (
              <>
                <Loader message="" />
                Creating Election...
              </>
            ) : (
              <>
                <FiCheck />
                Create Election
                <FiArrowRight />
              </>
            )}
          </Button>
        </Form>
      </AnimatedCard>
    </PageContainer>
  );
};

export default ElectionCreateForm;

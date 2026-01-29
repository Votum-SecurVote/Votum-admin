import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const StepContainer = styled.div`
  position: relative;
  margin-bottom: 3rem;
`;

const StepProgress = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border-color);
    transform: translateY(-50%);
    z-index: 1;
  }
`;

const Step = styled(motion.div)`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  .step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.active ? 'var(--primary)' : 'var(--bg-card)'};
    color: ${props => props.active ? 'white' : 'var(--text-muted)'};
    border: 2px solid ${props => props.active ? 'var(--primary)' : 'var(--border-color)'};
    font-weight: 600;
    transition: all var(--transition-normal);
  }
  
  .step-label {
    font-size: 0.875rem;
    color: ${props => props.active ? 'var(--primary)' : 'var(--text-muted)'};
    font-weight: ${props => props.active ? '600' : '400'};
  }
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
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    border-color: var(--bg-hover);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const DateTimeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled(motion.button)`
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  
  &.primary {
    background: var(--primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--primary-hover);
    }
  }
  
  &.secondary {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background: var(--bg-hover);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.9;
  }
`;

const steps = ['Details', 'Schedule', 'Rules', 'Review'];

const ElectionCreate = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        votingRules: formData.votingRules,
      };

      const response = await electionService.createElection(payload);
      const created = response.data;

      // Persist last election id for ballot designer
      localStorage.setItem('lastElectionId', created._id);

      setElectionId(created._id);
      setSuccess(true);

      // Smooth transition to ballot designer after brief success animation
      setTimeout(() => {
        window.location.href = '/admin/ballot/design';
      }, 1200);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <FormGroup>
              <Label>Election Title</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter election title"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose and scope of this election"
              />
            </FormGroup>
          </>
        );
      
      case 1:
        return (
          <>
            <FormGroup>
              <Label>
                <FiCalendar /> Start Date & Time
              </Label>
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>
                <FiClock /> End Date & Time
              </Label>
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate}
              />
            </FormGroup>
          </>
        );
      
      case 2:
        return (
          <FormGroup>
            <Label>Voting Rules</Label>
            <TextArea
              name="votingRules"
              value={formData.votingRules}
              onChange={handleInputChange}
              placeholder="Enter voting rules and guidelines..."
              rows={6}
            />
          </FormGroup>
        );
      
      case 3:
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedCard delay={0.1}>
                <h3>Review Election Details</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>Title:</strong> {formData.title}
                  </div>
                  <div>
                    <strong>Description:</strong> {formData.description || 'None'}
                  </div>
                  <div>
                    <strong>Start:</strong> {new Date(formData.startDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>End:</strong> {new Date(formData.endDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Rules:</strong> {formData.votingRules || 'None specified'}
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          </AnimatePresence>
        );
      
      default:
        return null;
    }
  };
  
  if (loading) {
    return <Loader message="Creating election..." />;
  }
  
  if (success) {
    return (
      <PageContainer>
        <SuccessMessage
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: 'backOut' }}
            style={{ display: 'inline-block', marginBottom: '1rem' }}
          >
            <FiCheck size={48} />
          </motion.div>
          <h3>Election Created Successfully!</h3>
          <p>Redirecting to Ballot Designer...</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            Election ID: {electionId}
          </motion.p>
        </SuccessMessage>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <StepContainer>
        <StepProgress>
          {steps.map((step, index) => (
            <Step
              key={step}
              active={index === currentStep}
              onClick={() => setCurrentStep(index)}
              style={{ cursor: 'pointer' }}
            >
              <motion.div
                className="step-circle"
                animate={{
                  scale: index === currentStep ? 1.1 : 1
                }}
              >
                {index < currentStep ? <FiCheck /> : index + 1}
              </motion.div>
              <span className="step-label">{step}</span>
            </Step>
          ))}
        </StepProgress>
      </StepContainer>
      
      <AnimatedCard>
        <Form onSubmit={handleSubmit}>
          {renderStep()}
          
          <ButtonGroup>
            {currentStep > 0 && (
              <Button
                type="button"
                className="secondary"
                onClick={prevStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                className="primary"
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={
                  (currentStep === 0 && !formData.title) ||
                  (currentStep === 1 && (!formData.startDate || !formData.endDate))
                }
              >
                Next
                <FiArrowRight />
              </Button>
            ) : (
              <Button
                type="submit"
                className="primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!formData.title || !formData.startDate || !formData.endDate}
              >
                Create Election
                <FiCheck />
              </Button>
            )}
          </ButtonGroup>
        </Form>
      </AnimatedCard>
    </PageContainer>
  );
};

export default ElectionCreate;
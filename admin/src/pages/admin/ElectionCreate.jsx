import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiCheck, FiArrowRight, FiAlignLeft, FiType, FiInfo } from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Helpers --- */
const istToUTC = (dateTimeLocalStr) => {
  if (!dateTimeLocalStr) return '';
  const istStr = `${dateTimeLocalStr}:00+05:30`;
  return new Date(istStr).toISOString();
};

const formatDatePreview = (dateStr) => {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

/* --- Styled Components --- */
const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* Slate-50 */
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  
  .step {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: block;
  }
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }
  p {
    color: #64748b;
    margin-top: 0.5rem;
    max-width: 600px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2.5rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

/* Form Styles */
const Card = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const Section = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child { border-bottom: none; }

  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  &:last-child { margin-bottom: 0; }

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fdfdfd;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  min-height: 100px;
  background: #fdfdfd;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover { background: #334155; }
  &:disabled { opacity: 0.7; cursor: wait; }
`;

/* Preview Card Styles */
const PreviewContainer = styled.div`
  position: sticky;
  top: 2rem;
`;

const PreviewLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LivePreviewCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);

  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    color: #64748b;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.4rem;
    margin: 0 0 0.75rem 0;
    color: #1e293b;
    line-height: 1.3;
  }

  .desc {
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: #475569;
      svg { color: #3b82f6; }
    }
  }
`;

const SuccessState = styled(motion.div)`
  max-width: 500px;
  margin: 4rem auto;
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  .icon-box {
    width: 64px; height: 64px;
    background: #dcfce7;
    color: #166534;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem auto;
    font-size: 2rem;
  }
  h2 { color: #1e293b; margin-bottom: 0.5rem; }
  p { color: #64748b; margin-bottom: 0; }
`;

/* --- Component --- */
const ElectionCreate = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const election = await electionService.createElection({
        title: formData.title,
        description: formData.description,
        startDate: istToUTC(formData.startDate),
        endDate: istToUTC(formData.endDate)
      });

      console.log("Election created:", election);

      localStorage.setItem("lastElectionId", election.id);

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/admin/ballot/design";
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Failed to create election");
      setLoading(false);
    }
  };

  if (loading && !success) return <Loader message="Creating election environment..." />;

  if (success) {
    return (
      <Page>
        <SuccessState initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="icon-box"><FiCheck /></div>
          <h2>Election Created!</h2>
          <p>Redirecting you to the Ballot Designer to add candidates...</p>
        </SuccessState>
      </Page>
    );
  }

  return (
    <Page>
      <Container>
        <Header>
          <span className="step">Step 1 of 3</span>
          <h1>Create New Election</h1>
          <p>Define the core details, schedule, and rules. You can add candidates in the next step.</p>
        </Header>

        <form onSubmit={handleSubmit}>
          <Grid>
            {/* Left Column: Input Form */}
            <Card>
              <Section>
                <h3><FiType /> Basic Details</h3>
                <FormGroup>
                  <label>Election Title</label>
                  <Input
                    name="title"
                    placeholder="e.g. Student Council Election 2026"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </FormGroup>
                <FormGroup>
                  <label>Description</label>
                  <TextArea
                    name="description"
                    placeholder="Briefly describe the purpose of this election..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Section>

              <Section>
                <h3><FiClock /> Schedule (IST)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup>
                    <label>Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>End Date & Time</label>
                    <Input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </div>
                <Button type="submit" whileTap={{ scale: 0.98 }}>
                  Save & Continue <FiArrowRight />
                </Button>
              </Section>

            </Card>

            {/* Right Column: Live Preview */}
            <PreviewContainer>
              <PreviewLabel><FiInfo /> Live Dashboard Preview</PreviewLabel>
              <LivePreviewCard>
                <span className="status">Draft</span>
                <h2>{formData.title || 'Untitled Election'}</h2>
                <div className="desc">
                  {formData.description || 'No description provided yet.'}
                </div>

                <div className="meta">
                  <div className="row">
                    <FiCalendar />
                    <span>Start: {formatDatePreview(formData.startDate)}</span>
                  </div>
                  <div className="row">
                    <FiClock />
                    <span>End: {formatDatePreview(formData.endDate)}</span>
                  </div>
                </div>
              </LivePreviewCard>
            </PreviewContainer>

          </Grid>
        </form>
      </Container>
    </Page>
  );
};

export default ElectionCreate;
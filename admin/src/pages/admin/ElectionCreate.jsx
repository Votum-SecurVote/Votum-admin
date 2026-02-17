import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiArrowRight,
  FiFileText,
  FiShield,
  FiAlertCircle,
  FiLock
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Helpers --- */
const istToUTC = (dateTimeLocalStr) => {
  if (!dateTimeLocalStr) return '';
  const istStr = `${dateTimeLocalStr}:00+05:30`;
  return new Date(istStr).toISOString();
};

const formatDatePreview = (dateStr) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

/* --- Styled Components (Government Grade) --- */
const Page = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Disables full-page scrolling */
  background-color: #f1f5f9;
  font-family: 'Public Sans', 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
`;

const ProgressTracker = styled.div`
  display: flex;
  gap: 3rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #cbd5e1;
  padding-bottom: 1rem;
  flex-shrink: 0;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.$active ? '#1e40af' : '#64748b'};
  font-weight: ${props => props.$active ? '700' : '500'};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .num {
    width: 24px;
    height: 24px;
    background: ${props => props.$active ? '#1e40af' : '#cbd5e1'};
    color: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  flex: 1; 
  min-height: 0; /* Critical for internal overflow scrolling */
`;

const FormSection = styled.div`
  background: white;
  border-radius: 4px;
  border-top: 4px solid #1e40af;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  overflow-y: auto; /* Internal scroll only */
  height: 90%;
  box-sizing: border-box;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #f8fafc; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

/* --- Form Elements --- */
const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  color: #0f172a;
  &:focus {
    outline: none;
    border-color: #1e40af;
    box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #1e40af;
  }
`;

const HelperText = styled.p`
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

/* --- White Summary Panel --- */
const SummaryPanel = styled.aside`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: 90%;
  box-sizing: border-box;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  h3 { 
    font-size: 0.8rem; 
    text-transform: uppercase; 
    color: #475569; 
    margin: 0 0 1.5rem 0;
    letter-spacing: 0.1em;
    font-weight: 800;
  }
`;

const SummaryItem = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;

  .label { color: #64748b; font-size: 0.7rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;}
  .value { color: #0f172a; font-size: 1rem; font-weight: 700; word-break: break-word; }
`;

const PrimaryButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  margin-top: auto;
  transition: all 0.2s;

  &:hover { background: #1d4ed8; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

/* --- Main Component --- */
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

      localStorage.setItem("lastElectionId", election.id);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin/ballot/design";
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("System Error: Failed to initialize election record.");
      setLoading(false);
    }
  };

  if (loading && !success) return <Loader message="Cryptographically securing election record..." />;

  if (success) {
    return (
      <Page style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '4rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <FiShield size={64} color="#16a34a" />
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: '1.5rem' }}>Record Secured</h2>
          <p style={{ color: '#475569' }}>Transaction successful. Redirecting to Specification Module...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Container>
        <ProgressTracker>
          <Step $active><div className="num">1</div> General Configuration</Step>
          <Step><div className="num">2</div> Ballot Design</Step>
          <Step><div className="num">3</div> Voter Authorization</Step>
        </ProgressTracker>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <MainGrid>
            {/* Left Column: Form (Internal Scroll) */}
            <FormSection>
              <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0 }}>Establish New Election</h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Initialize the core parameters for the blockchain-backed voting environment.</p>
              </header>

              <FormGroup>
                <Label>Legal Election Title</Label>
                <Input
                  name="title"
                  placeholder="e.g. 2026 General Assembly Election"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <HelperText><FiLock size={12} /> This title will be immutable once the ballot window opens.</HelperText>
              </FormGroup>

              <FormGroup>
                <Label>Official Preamble / Description</Label>
                <TextArea
                  name="description"
                  placeholder="Provide the constitutional or organizational context for this vote..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <FormGroup>
                  <Label>Commencement (IST)</Label>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Conclusion (IST)</Label>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </div>
              <HelperText><FiAlertCircle size={14} /> All timestamps are recorded in Indian Standard Time (UTC+5:30).</HelperText>
            </FormSection>

            {/* Right Column: Summary (Fixed) */}
            <SummaryPanel>
              <h3>Record Verification</h3>

              <SummaryItem>
                <div className="label">Election Name</div>
                <div className="value">{formData.title || "NOT SPECIFIED"}</div>
              </SummaryItem>

              <SummaryItem>
                <div className="label">Status</div>
                <div className="value" style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>●</span> Pending Registration
                </div>
              </SummaryItem>

              <SummaryItem>
                <div className="label">Polling Window</div>
                <div className="value">
                  {formatDatePreview(formData.startDate)} — {formatDatePreview(formData.endDate)}
                </div>
              </SummaryItem>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
                <FiAlertCircle style={{ marginBottom: '0.5rem', display: 'block' }} />
                By proceeding, you acknowledge that these dates define the cryptographical opening and closing of the digital ballot box.
              </div>

              <PrimaryButton type="submit">
                Finalize & Proceed <FiArrowRight />
              </PrimaryButton>
            </SummaryPanel>
          </MainGrid>
        </form>
      </Container>
    </Page>
  );
};

export default ElectionCreate;
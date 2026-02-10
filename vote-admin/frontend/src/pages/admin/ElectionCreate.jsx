import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiCalendar, FiClock, FiCheck, FiArrowRight, FiFileText, FiShield } from 'react-icons/fi';
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

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 2fr);
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled(motion.div)`
  background: linear-gradient(145deg, var(--primary) 0%, var(--primary-hover) 60%, #002855 100%);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem;
  color: #f9fafb;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 55%),
      radial-gradient(circle at bottom left, rgba(15,23,42,0.18), transparent 55%);
    mix-blend-mode: soft-light;
    pointer-events: none;
  }
`;

const SummaryContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const SummaryPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.35);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
`;

const SummaryItem = styled.li`
  opacity: 0.9;

  span {
    font-weight: 600;
  }
`;

const SummaryFooter = styled.div`
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.25);
  font-size: 0.8rem;
  opacity: 0.9;
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

const DateField = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const DateInput = styled(Input)`
  padding-right: 2.5rem;
`;

const DateIcon = styled.button`
  position: absolute;
  right: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;

  &:hover {
    background: var(--bg-hover);
    color: var(--primary);
  }
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 20;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  padding: 0.75rem 0.75rem 0.9rem;
  width: 260px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const CalendarNavButton = styled.button`
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;

  &:hover {
    background: var(--bg-hover);
    color: var(--primary);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.15rem;
  font-size: 0.75rem;
`;

const CalendarWeekday = styled.div`
  text-align: center;
  padding: 0.2rem 0;
  font-weight: 600;
  color: var(--text-muted);
`;

const CalendarCell = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0;
  cursor: pointer;
  background: ${({ $isSelected }) =>
    $isSelected ? 'var(--primary)' : 'transparent'};
  color: ${({ $isSelected }) =>
    $isSelected ? '#ffffff' : 'var(--text-primary)'};
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};

  &:hover:not(:disabled) {
    background: ${({ $isSelected }) =>
      $isSelected ? 'var(--primary-hover)' : 'var(--bg-hover)'};
  }
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
  gap: 0.5rem;
  font-size: 0.8rem;

  input[type='time'] {
    flex: 1;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 0.75rem;
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

/* =========================
   DateTime Picker helpers
========================= */

const pad = (n) => String(n).padStart(2, '0');

const parseLocalDateTime = (value) => {
  if (!value) return { date: null, time: '' };
  const [datePart, timePart] = value.split('T');
  if (!datePart) return { date: null, time: timePart || '' };
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return { date: null, time: timePart || '' };
  const date = new Date(y, m - 1, d);
  return { date, time: timePart || '' };
};

const formatLocalDateTime = (date, time) => {
  if (!date || !time) return '';
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}T${time}`;
};

const monthLabel = (date) =>
  date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

const buildCalendarDays = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const start = new Date(year, month, 1);
  const firstDay = start.getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(d);
  }
  return cells;
};

const DateTimePicker = ({ name, label, icon, value, onChange, required }) => {
  const { date: parsedDate, time: parsedTime } = parseLocalDateTime(value);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(parsedDate || new Date());
  const [time, setTime] = React.useState(parsedTime || '');

  const handleInputChange = (e) => {
    onChange(e);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const nextDate = new Date(month.getFullYear(), month.getMonth(), day);
    const nextValue = formatLocalDateTime(nextDate, time || '09:00');
    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleTimeChange = (e) => {
    const nextTime = e.target.value;
    setTime(nextTime);
    if (parsedDate) {
      const nextValue = formatLocalDateTime(parsedDate, nextTime);
      onChange({
        target: {
          name,
          value: nextValue,
        },
      });
    }
  };

  const selectedDay = parsedDate ? parsedDate.getDate() : null;
  const cells = buildCalendarDays(month);

  return (
    <FormGroup>
      <Label>
        {icon} {label}
      </Label>
      <DateField>
        <div style={{ position: 'relative' }}>
          <DateInput
            name={name}
            placeholder="YYYY-MM-DDTHH:mm"
            value={value}
            onChange={handleInputChange}
            required={required}
          />
          <DateIcon
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={`Open ${label} calendar`}
          >
            <FiCalendar size={16} />
          </DateIcon>

          {open && (
            <CalendarPopover>
              <CalendarHeader>
                <CalendarNavButton
                  type="button"
                  onClick={() =>
                    setMonth(
                      (m) =>
                        new Date(
                          m.getFullYear(),
                          m.getMonth() - 1,
                          1
                        )
                    )
                  }
                >
                  ‹
                </CalendarNavButton>
                <span>{monthLabel(month)}</span>
                <CalendarNavButton
                  type="button"
                  onClick={() =>
                    setMonth(
                      (m) =>
                        new Date(
                          m.getFullYear(),
                          m.getMonth() + 1,
                          1
                        )
                    )
                  }
                >
                  ›
                </CalendarNavButton>
              </CalendarHeader>

              <CalendarGrid>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                  <CalendarWeekday key={d}>{d}</CalendarWeekday>
                ))}
                {cells.map((day, idx) =>
                  day === null ? (
                    <div key={idx} />
                  ) : (
                    <CalendarCell
                      key={idx}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      $isSelected={day === selectedDay}
                    >
                      {day}
                    </CalendarCell>
                  )
                )}
              </CalendarGrid>

              <TimeRow>
                <span>Time</span>
                <input type="time" value={time} onChange={handleTimeChange} />
              </TimeRow>
            </CalendarPopover>
          )}
        </div>
      </DateField>
    </FormGroup>
  );
};

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
      <Layout>
        <SummaryCard
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SummaryContent>
            <SummaryHeader>
              <FiShield size={24} />
              <div>
                <h2>Election Summary</h2>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  Preview key details as you configure this election.
                </div>
              </div>
            </SummaryHeader>

            <SummaryPill>
              <FiFileText size={14} />
              <span>Step 1 of 3 · Basics</span>
            </SummaryPill>

            <SummaryList>
              <SummaryItem>
                Title: <span>{formData.title || 'Untitled election'}</span>
              </SummaryItem>
              <SummaryItem>
                Window:{' '}
                <span>
                  {formData.startDate && formData.endDate
                    ? 'Scheduled'
                    : 'Not scheduled yet'}
                </span>
              </SummaryItem>
              <SummaryItem>
                Rules:{' '}
                <span>{formData.votingRules ? 'Custom rules set' : 'Default rules'}</span>
              </SummaryItem>
            </SummaryList>

            <SummaryFooter>
              All configuration changes on this screen are saved only when you create the
              election. You can refine ballots and publishing in later steps.
            </SummaryFooter>
          </SummaryContent>
        </SummaryCard>

        <AnimatedCard as="section">
          <div
            style={{
              borderBottom: `1px solid var(--border-color)`,
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                marginBottom: '0.3rem',
              }}
            >
              Step 1 of 3
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Create New Election
            </h1>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Basics */}
            <div style={{ marginBottom: '1rem' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Basics
              </h3>
              <FormGroup>
                <Label>Election Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} required />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormGroup>
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--border-color)',
                margin: '0 0 1.25rem',
              }}
            />

            {/* Scheduling */}
            <div style={{ marginBottom: '1rem' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Scheduling
              </h3>

              <DateTimePicker
                name="startDate"
                label="Start Date (IST)"
                icon={<FiCalendar />}
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <DateTimePicker
                name="endDate"
                label="End Date (IST)"
                icon={<FiClock />}
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--border-color)',
                margin: '0 0 1.25rem',
              }}
            />

            {/* Rules */}
            <div>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                Rules
              </h3>
              <FormGroup>
                <Label>Voting Rules</Label>
                <TextArea
                  name="votingRules"
                  value={formData.votingRules}
                  onChange={handleChange}
                  placeholder="e.g. One vote per voter, simple majority wins."
                />
              </FormGroup>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit">
                Continue to Ballot Design <FiArrowRight />
              </Button>
            </div>
          </Form>
        </AnimatedCard>
      </Layout>
    </PageContainer>
  );
};

export default ElectionCreate;

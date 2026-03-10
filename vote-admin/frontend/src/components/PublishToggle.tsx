import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import AnimatedCard from './AnimatedCard';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.span<{ isPublished: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => (props.isPublished ? 'var(--success)15' : 'var(--warning)15')};
  color: ${props => (props.isPublished ? 'var(--success)' : 'var(--warning)')};
`;

const Button = styled(motion.button)<{ variant?: 'publish' | 'unpublish' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-fast);
  background: ${props => (props.variant === 'publish' ? 'var(--success)' : 'var(--warning)')};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(AnimatedCard)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  h2 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  p {
    margin-bottom: 1.5rem;
    color: var(--text-muted);
  }
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
`;

interface PublishToggleProps {
  isPublished: boolean;
  onToggle: () => Promise<void>;
  entityType?: string;
  entityName?: string;
  disabled?: boolean;
}

const PublishToggle: React.FC<PublishToggleProps> = ({
  isPublished,
  onToggle,
  entityType = 'item',
  entityName = '',
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleToggle = () => {
    setShowModal(true);
  };

  const confirmToggle = async () => {
    try {
      setProcessing(true);
      await onToggle();
      setShowModal(false);
    } catch (error) {
      console.error('Toggle failed:', error);
      alert(`Failed to ${isPublished ? 'unpublish' : 'publish'} ${entityType}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <ToggleContainer>
        <StatusBadge isPublished={isPublished}>
          {isPublished ? <FiCheck /> : <FiX />}
          {isPublished ? 'Published' : 'Draft'}
        </StatusBadge>
        <Button
          variant={isPublished ? 'unpublish' : 'publish'}
          onClick={handleToggle}
          disabled={disabled || processing}
        >
          {isPublished ? (
            <>
              <FiDownload />
              Unpublish
            </>
          ) : (
            <>
              <FiUpload />
              Publish
            </>
          )}
        </Button>
      </ToggleContainer>

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !processing && setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>
                {isPublished ? 'Unpublish' : 'Publish'} {entityType}
              </h2>
              <p>
                Are you sure you want to {isPublished ? 'unpublish' : 'publish'} this {entityType}?
                {entityName && <strong> {entityName}</strong>}
              </p>
              <div className="modal-actions">
                <Button
                  variant="unpublish"
                  onClick={() => {
                    setShowModal(false);
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant={isPublished ? 'unpublish' : 'publish'}
                  onClick={confirmToggle}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublishToggle;

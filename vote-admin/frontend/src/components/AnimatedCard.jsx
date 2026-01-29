import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const CardContainer = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
  }
`;

const AnimatedCard = ({ children, delay = 0, ...props }) => {
  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

export default AnimatedCard;
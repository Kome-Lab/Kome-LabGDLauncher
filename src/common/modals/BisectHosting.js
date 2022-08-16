import React, { memo } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';
import BisectHostingLogo from '../../ui/BisectHosting';

const BisectHosting = () => {
  return (
    <Modal
      css={`
        height: 360px;
        width: 500px;
        font-size: 10px;
        line-height: 1.8;
      `}
      title="Kome-Lab"
    >
      <Container>
        <BisectHostingLogo size={70} hover />
        <h2
          css={`
            margin-top: 20px;
          `}
        >
          Studio-Kometubuを支えてる縁の下の力持ち{' '}
        </h2>
      </Container>
    </Modal>
  );
};

export default memo(BisectHosting);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.palette.text.primary};
`;

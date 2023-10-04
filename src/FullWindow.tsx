import React, { FC } from 'react';
import './index.css';

const fullWindow: React.CSSProperties = {
  height: '100vh',
  widows: '100%',
};

const centroContainer: React.CSSProperties = {
  ...fullWindow,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
};

export const FullWindow: FC<{ children: React.ReactNode; }> = ({ children }) => {

  return (
    <div style={centroContainer}>
      {children}
    </div>
  );
};

export default FullWindow;

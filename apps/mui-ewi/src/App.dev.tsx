import React from 'react';
import App from './App';
import { DevProvider } from './context/DevContext';

// Development version - just wraps the main App with debug context
const DevApp: React.FC = () => {
  return (
    <DevProvider>
      <App />
    </DevProvider>
  );
};

export default DevApp;
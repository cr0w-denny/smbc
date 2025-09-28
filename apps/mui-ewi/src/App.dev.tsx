import React from 'react';
import App from './App';

// Development version - DevProvider is now inside AppletProvider in App.tsx
const DevApp: React.FC = () => {
  return <App />;
};

export default DevApp;
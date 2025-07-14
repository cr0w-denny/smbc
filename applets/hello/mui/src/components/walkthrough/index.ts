import React from 'react';

export { Step1_DefineAPI } from './Step1_DefineAPI';
export { Step2_DefinePermissions } from './Step2_DefinePermissions';
export { Step3_ComponentStructure } from './Step3_ComponentStructure';
export { Step4_DataViews } from './Step4_DataViews';
export { Step5_HostIntegration } from './Step5_HostIntegration';

// Types for step configuration
export interface WalkthroughStep {
  label: string;
  component: React.ComponentType;
}
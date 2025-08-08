import { addons } from '@storybook/manager-api';

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
  // Set the initial active tab to the Design Tokens Overview story
  initialActive: 'design-tokens--overview',
});
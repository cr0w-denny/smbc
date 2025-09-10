import React from 'react';
import { Box, Typography } from '@mui/material';

export const RelatedTab: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Related Items
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Related events and documents will be displayed here.
      </Typography>
    </Box>
  );
};
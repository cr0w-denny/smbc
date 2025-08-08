import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DashboardAppShell } from '@smbc/mui-components';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Popover, Box } from '@mui/material';

const meta: Meta<typeof DashboardAppShell> = {
  title: 'MUI Components/DashboardAppShell',
  component: DashboardAppShell,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof DashboardAppShell>;

const SettingsPopover = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <SettingsIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box p={2}>
          <Typography variant="body1">Settings Panel</Typography>
          <Typography variant="body2" color="text.secondary">
            Add toggles or config here.
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

const SampleTable = () => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event ID</TableCell>
          <TableCell>Obligor</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Due Date</TableCell>
          <TableCell>Analyst</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[1, 2, 3, 4, 5].map((row) => (
          <TableRow key={row}>
            <TableCell>EV00{row}</TableCell>
            <TableCell>Company {row}</TableCell>
            <TableCell>On Course</TableCell>
            <TableCell>2025-02-{10 + row}</TableCell>
            <TableCell>Analyst {row}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export const Default: Story = {
  args: {
    logo: <Typography variant="h6">EWI</Typography>,
    navigation: [
      { label: 'Events Dashboard', type: 'link', href: '/events' },
      { label: 'Obligor Dashboard', type: 'link', href: '/obligor' },
      { label: 'Subscription', type: 'link', href: '/subscription' },
      {
        label: 'Managers',
        type: 'dropdown',
        items: [
          { label: 'Manager A', href: '/managers/a' },
          { label: 'Manager B', href: '/managers/b' },
          { label: 'Manager C', href: '/managers/c' },
        ],
      },
      {
        label: 'Reporting',
        type: 'dropdown',
        items: [
          { label: 'Monthly Reports', href: '/reports/monthly' },
          { label: 'Annual Reports', href: '/reports/annual' },
          { label: 'Custom Reports', href: '/reports/custom' },
        ],
      },
      { label: 'Quick Guide', type: 'button', color: 'primary' },
    ],
    filterBar: {
      dateRange: {
        from: '2025-01-01',
        to: '2025-12-31',
      },
      fields: [
        { label: 'Status', value: '', onChange: () => {} },
        { label: 'ExRatings', value: '', onChange: () => {} },
        {
          label: 'Workflow',
          value: '',
          type: 'select',
          onChange: () => {},
          options: [
            { label: 'All', value: '' },
            { label: '1 LOD Review', value: '1LOD' },
            { label: '2 LOD Review', value: '2LOD' },
            { label: '1 LOD Analyst', value: 'Analyst' },
          ],
        },
      ],
      statusChips: [
        { label: 'On Course', color: 'success' },
        { label: 'Almost Due', color: 'warning' },
        { label: 'Past Due', color: 'error' },
        { label: 'Needs Attention', color: 'secondary' },
        { label: 'Discretionary', color: 'info' },
        { label: 'Mandatory', color: 'default' },
      ],
      actions: [{ label: 'Apply', onClick: () => console.log('Apply clicked') }],
      metadata: 'Updated on 04/20/25',
      extra: <SettingsPopover />,
    },
    children: <SampleTable />,
  },
};

export const WithoutFilterBar: Story = {
  args: {
    logo: <Typography variant="h6">Dashboard</Typography>,
    navigation: [
      { label: 'Home', type: 'link', href: '/' },
      { label: 'Analytics', type: 'link', href: '/analytics' },
      { label: 'Reports', type: 'link', href: '/reports' },
      { label: 'Help', type: 'button', variant: 'outlined' },
    ],
    children: (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a simplified version without the filter bar.
        </Typography>
      </Paper>
    ),
  },
};

export const MinimalNavigation: Story = {
  args: {
    navigation: [
      { label: 'Dashboard', type: 'link', href: '/' },
      { label: 'Settings', type: 'button', variant: 'text' },
    ],
    children: (
      <Typography variant="h6" color="text.secondary">
        Minimal navigation example
      </Typography>
    ),
  },
};
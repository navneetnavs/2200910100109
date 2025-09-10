import React, { useState, useEffect } from 'react';
import { Container, Box, Alert } from '@mui/material';
import Analytics from '../components/Analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/urls/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading statistics..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <Analytics stats={stats} />
      </Box>
    </Container>
  );
};

export default Statistics;

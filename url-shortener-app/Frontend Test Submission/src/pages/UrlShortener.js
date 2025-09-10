import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import UrlForm from '../components/UrlForm';
import UrlList from '../components/UrlList';

const UrlShortener = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUrlCreated = () => {
    // Trigger refresh of URL list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <UrlForm onUrlCreated={handleUrlCreated} />
        <UrlList refreshTrigger={refreshTrigger} />
      </Box>
    </Container>
  );
};

export default UrlShortener;

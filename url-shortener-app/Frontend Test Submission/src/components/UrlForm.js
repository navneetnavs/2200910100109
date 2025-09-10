import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const UrlForm = ({ onUrlCreated }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortId, setShortId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Attempting to shorten URL:', originalUrl);
      console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
      
      const response = await axios.post('http://localhost:5002/api/urls/shorten', {
        originalUrl,
        customAlias: customAlias || undefined
      });

      const { shortUrl, shortId } = response.data;
      setShortUrl(shortUrl);
      setShortId(shortId);
      setSuccess(true);
      setError('');
      
      console.log('URL shortened successfully:', shortUrl);
      
      // Refresh the URLs list
      if (onUrlCreated) {
        onUrlCreated();
      }
    } catch (error) {
      console.error('Error shortening URL:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to shorten URL');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setSuccess(true);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Shorten Your URL
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {shortUrl && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={copyToClipboard}
            >
              <ContentCopy />
            </IconButton>
          }
        >
          <strong>Short URL:</strong> {shortUrl}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Original URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="https://example.com/very-long-url"
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Custom Alias (Optional)"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          placeholder="my-custom-link"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UrlForm;

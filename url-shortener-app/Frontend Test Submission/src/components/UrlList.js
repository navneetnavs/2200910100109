import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Pagination
} from '@mui/material';
import {
  ContentCopy,
  Delete,
  Edit,
  BarChart,
  Launch,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';

const UrlList = ({ refreshTrigger }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, url: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, url: null });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUrls();
  }, [page, refreshTrigger]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5002/api/urls');
      setUrls(response.data || []);
      setPagination({ total: 1, current: 1 });
    } catch (error) {
      console.error('Error fetching URLs:', error);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEdit = (url) => {
    setEditDialog({ open: true, url: { ...url } });
  };

  const handleEditSave = async () => {
    try {
      const { url } = editDialog;
      await axios.put(`http://localhost:5002/api/urls/${url.shortId}`, {
        description: url.description,
        tags: url.tags,
        isActive: url.isActive
      });
      
      setEditDialog({ open: false, url: null });
      fetchUrls();
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  };

  const handleDelete = (url) => {
    setDeleteDialog({ open: true, url });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5002/api/urls/${deleteDialog.url.shortId}`);
      setDeleteDialog({ open: false, url: null });
      fetchUrls();
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Loading URLs...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Your URLs ({Array.isArray(urls) ? urls.length : 0})
      </Typography>

      {!Array.isArray(urls) || urls.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No URLs found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first shortened URL above
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {Array.isArray(urls) && urls.map((url) => (
              <Card key={url.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {url.description || 'Untitled URL'}
                      </Typography>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Original URL:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Short URL:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: '#e3f2fd',
                              p: 1,
                              borderRadius: 1,
                              flexGrow: 1
                            }}
                          >
                            {url.shortUrl}
                          </Typography>
                          <Tooltip title="Copy URL">
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(url.shortUrl)}
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open URL">
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(url.shortUrl, '_blank')}
                            >
                              <Launch />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {url.tags && url.tags.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          {url.tags.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                          {url.clicks} clicks
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Created: {formatDate(url.createdAt)}
                        </Typography>
                        <Chip 
                          label={url.isActive ? 'Active' : 'Inactive'} 
                          color={url.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                      <Tooltip title="View Statistics">
                        <IconButton size="small" color="primary">
                          <BarChart />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit URL">
                        <IconButton size="small" onClick={() => handleEdit(url)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete URL">
                        <IconButton size="small" color="error" onClick={() => handleDelete(url)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {pagination.total > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.total}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, url: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit URL</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={editDialog.url?.description || ''}
            onChange={(e) => setEditDialog({
              ...editDialog,
              url: { ...editDialog.url, description: e.target.value }
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={editDialog.url?.tags?.join(', ') || ''}
            onChange={(e) => setEditDialog({
              ...editDialog,
              url: { 
                ...editDialog.url, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              }
            })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={editDialog.url?.isActive || false}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  url: { ...editDialog.url, isActive: e.target.checked }
                })}
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, url: null })}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, url: null })}>
        <DialogTitle>Delete URL</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this URL? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {deleteDialog.url?.shortUrl}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, url: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UrlList;

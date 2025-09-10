import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  Link as LinkIcon,
  Visibility,
  Schedule
} from '@mui/icons-material';

const Analytics = ({ stats }) => {
  const {
    totalUrls = 0,
    totalClicks = 0,
    activeUrls = 0,
    recentUrls = 0,
    topUrls = [],
    clickData = []
  } = stats || {};

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxClicks = Math.max(...data.map(d => d.clicks));
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Click Activity (Last 30 Days)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 100, overflow: 'auto' }}>
          {data.map((day, index) => (
            <Box
              key={index}
              sx={{
                minWidth: 20,
                height: maxClicks > 0 ? `${(day.clicks / maxClicks) * 80 + 10}px` : '10px',
                backgroundColor: 'primary.main',
                borderRadius: '2px 2px 0 0',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                position: 'relative'
              }}
              title={`${day.date}: ${day.clicks} clicks`}
            >
              <Typography variant="caption" sx={{ 
                position: 'absolute', 
                bottom: -20, 
                fontSize: '10px',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center'
              }}>
                {new Date(day.date).getDate()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp />
        Analytics Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total URLs"
            value={totalUrls}
            icon={<LinkIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clicks"
            value={totalClicks}
            icon={<Visibility sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active URLs"
            value={activeUrls}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent URLs"
            value={recentUrls}
            icon={<Schedule sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <SimpleChart data={clickData} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing URLs
            </Typography>
            {topUrls.length > 0 ? (
              <List dense>
                {topUrls.map((url, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            /{url.shortId}
                          </Typography>
                          <Chip 
                            label={`${url.clicks} clicks`} 
                            size="small" 
                            color="primary" 
                          />
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No URLs created yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;

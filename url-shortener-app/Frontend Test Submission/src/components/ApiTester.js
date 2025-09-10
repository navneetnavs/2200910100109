import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Paper
} from '@mui/material';

const ApiTester = () => {
  const apis = [
    {
      title: 'Registration API',
      method: 'POST',
      endpoint: '/api/auth/register',
      description: 'Register a new user and get clientID & clientSecret',
      requestBody: {
        email: 'navneetkumar1600424@gmail.com',
        name: 'Navneet Kumar',
        mobileNo: '9927778260',
        githubUsername: 'navneetnavs',
        rollNo: '2200910100109',
        accessCode: 'NvNtBu'
      },
      responseExample: {
        email: 'navneetkumar1600424@gmail.com',
        name: 'Navneet Kumar',
        mobileNo: '9927778260',
        githubUsername: 'navneetnavs',
        rollNo: '2200910100109',
        accessCode: 'NvNtBu',
        clientID: 'generated-uuid',
        clientSecret: 'generated-uuid'
      }
    },
    {
      title: 'Authentication API',
      method: 'POST',
      endpoint: '/api/auth/auth',
      description: 'Authenticate and get access token',
      requestBody: {
        email: 'navneetkumar1600424@gmail.com',
        name: 'Navneet Kumar',
        rollNo: '2200910100109',
        accessCode: 'NvNtBu',
        clientID: 'from-registration-response',
        clientSecret: 'from-registration-response'
      },
      responseExample: {
        token_type: 'Bearer',
        access_token: 'jwt-token...',
        expires_in: 604800
      }
    },
    {
      title: 'Logging API',
      method: 'POST',
      endpoint: '/api/logs',
      description: 'Create log entries for monitoring',
      requestBody: {
        stack: 'backend',
        level: 'error',
        package: 'handler',
        message: 'received string, expected bool'
      },
      responseExample: {
        login: 'defaultUser-1508-4153-8b49-58ff5d7c403',
        message: 'log created successfully'
      }
    }
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'POST': return 'success';
      case 'GET': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Server Status: Backend running on http://localhost:5002
        </Typography>
        <Typography variant="body2">
          Use Postman or any API client to test these endpoints. No frontend login required - authentication is API-only.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {apis.map((api, index) => (
          <Grid item xs={12} key={index}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={api.method} 
                    color={getMethodColor(api.method)} 
                    sx={{ mr: 2, fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" component="h3">
                    {api.title}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {api.description}
                </Typography>

                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Endpoint:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {api.method} http://localhost:5002{api.endpoint}
                  </Typography>
                </Paper>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Request Body:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f1f3f4' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(api.requestBody, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Response Example:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(api.responseExample, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Testing Flow:</strong><br />
          1. First call Registration API to get clientID and clientSecret<br />
          2. Use those credentials in Authentication API to get access_token<br />
          3. Test Logging API with different stack/level combinations<br />
          4. All data is stored in memory (no database required)
        </Typography>
      </Alert>
    </Box>
  );
};

export default ApiTester;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [credentials, setCredentials] = useState(JSON.parse(localStorage.getItem('credentials') || 'null'));
  const [loading, setLoading] = useState(true);

  // Auto-login with predefined credentials
  useEffect(() => {
    const autoLogin = async () => {
      if (token && credentials) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(credentials);
        setLoading(false);
      } else {
        // Auto-register and login with predefined details
        try {
          const userData = {
            email: 'navneetkumar1800242@gmail.com',
            name: 'Navneet Kumar',
            mobileNo: '9027978260',
            githubUsername: 'navneetnavs',
            rollNo: '2200910100109',
            accessCode: 'NWtBu'
          };
          
          console.log('Starting auto-registration...');
          await register(userData);
        } catch (error) {
          console.error('Auto-login failed:', error);
          setLoading(false);
        }
      }
    };
    
    autoLogin();
  }, []);

  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      
      // Step 1: Register to get clientID and clientSecret
      const registerResponse = await axios.post('http://localhost:5002/api/auth/register', userData);
      const userCredentials = registerResponse.data;
      console.log('Registration successful:', userCredentials);
      
      // Step 2: Authenticate to get access token
      const authData = {
        email: userCredentials.email,
        name: userCredentials.name,
        mobileNo: userCredentials.mobileNo,
        githubUsername: userCredentials.githubUsername,
        rollNo: userCredentials.rollNo,
        accessCode: userCredentials.accessCode,
        clientID: userCredentials.clientID,
        clientSecret: userCredentials.clientSecret
      };
      
      console.log('Authenticating with:', authData);
      const authResponse = await axios.post('http://localhost:5002/api/auth/auth', authData);
      const { access_token } = authResponse.data;
      console.log('Authentication successful, token received');
      
      // Store credentials and token
      localStorage.setItem('credentials', JSON.stringify(userCredentials));
      localStorage.setItem('token', access_token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Update state
      setCredentials(userCredentials);
      setToken(access_token);
      setUser(userCredentials);
      setLoading(false);
      
      console.log('Auto-login completed successfully');
      
    } catch (error) {
      console.error('Registration/Authentication error:', error.response?.data || error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCredentials(null);
    localStorage.removeItem('token');
    localStorage.removeItem('credentials');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    credentials,
    loading,
    isAuthenticated: !!token && !!user,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

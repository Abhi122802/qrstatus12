import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import {
  Button,
  Stack,
  Typography,
  Box,
  Paper,
  TextField,
  Link,
  Alert,
  Avatar,
  Grid,
  CssBaseline,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useApi from './api';

// Define keyframes for the animated gradient
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// A simple copyright component for the bottom
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        QR Scan App
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const api = useApi();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors array from express-validator
        if (data.errors) {
          const errorMsg = data.errors.map(err => err.msg).join(' ');
          throw new Error(errorMsg);
        }
        // Handle other errors like invalid credentials
        throw new Error(data.message || 'An unknown error occurred.');
      }

      // On successful login, save the token and navigate.
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        width:"100vw", // Ensure it covers the full viewport height
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: `${gradientAnimation} 15s ease infinite`,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <CssBaseline />
      <Paper
        elevation={12}
        sx={{
          py: { xs: 4, sm: 6 },
          px: { xs: 3, sm: 5 },
          borderRadius: 4,
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Glassmorphism effect
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={3}>
              <TextField label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoFocus />
              <TextField label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2, mb: 2 }}>
                Sign In
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Stack>
            <Copyright sx={{ mt: 5 }} />
        </Box>
      </Paper>
    </Grid>
  );
};

export default LoginPage;
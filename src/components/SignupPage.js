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

// Define keyframes for the animated gradient, just like in LoginPage.js
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // This sends the user's data to your backend API endpoint
      // Make sure this URL matches where your backend server is running
      const response = await fetch('https://backendqrscan-uhya.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors array from express-validator
        if (data.errors) {
          const errorMsg = data.errors.map(err => err.msg).join(' ');
          throw new Error(errorMsg);
        }
        throw new Error(data.message || 'Failed to sign up.');
      }

      // On successful signup, navigate to the login page
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

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

  return (
    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        width: "100vw",
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
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSignup} sx={{ mt: 1, width: '100%' }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack spacing={2}>
              <TextField label="Name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
              <TextField label="Password" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
              <TextField label="Confirm Password" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3, mb: 2 }}>
                Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Stack>
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
        <Paper/>
      </Paper>
      </Grid>
    
  );
};

export default SignupPage;
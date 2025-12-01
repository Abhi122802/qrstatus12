import React from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ViewListIcon from '@mui/icons-material/ViewList';

// Define keyframes for the animated gradient, just like in LoginPage.js
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ActionCard = ({ title, description, icon, onClick }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ color: 'primary.main', mb: 2 }}>
          {React.cloneElement(icon, { sx: { fontSize: 50 } })}
        </Box>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  </Grid>
);

const Homepage = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Generate QR',
      description: 'Create new, unique QR codes for your products or assets.',
      icon: <AddCircleOutlineIcon />,
      onClick: () => navigate('/create'),
    },
    {
      title: 'View All',
      description: 'Browse, print, and manage all the QR codes you have generated.',
      icon: <ViewListIcon />,
      onClick: () => navigate('/list'),
    },
    {
      title: 'Scan & Deactivate',
      description: 'Scan a QR code to deactivate it or mark it as out of service.',
      icon: <HighlightOffIcon color="error" />,
      onClick: () => navigate('/scan/deactivate'),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: `${gradientAnimation} 15s ease infinite`,
        p: { xs: 2, sm: 4 },
        boxSizing: 'border-box', // Ensure padding is included in the element's total width and height
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          QR Management Hub
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your central dashboard for generating and managing QR codes.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </Grid>
    </Box>
  );
};

export default Homepage;
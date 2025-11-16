import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link as MuiLink,
  Button,
  Alert,
  CardActions,
  IconButton,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const QRList = () => {
  const [qrs, setQrs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchQRs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/qrcodes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setQrs(data);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setSnackbar({ open: true, message: 'Could not fetch QR codes from server.' });
      }
    };
    fetchQRs();
  }, []);

  const handleClearAll = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/qrcodes', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to clear QR codes.');
      }
      setQrs([]);
      setSnackbar({ open: true, message: 'All QR codes have been cleared.' });
    } catch (error) {
      console.error('Error clearing QR codes:', error);
      setSnackbar({ open: true, message: 'Error: Could not clear QR codes.' });
    }
  };

  const handleDownload = (qr) => {
    const link = document.createElement('a');
    link.href = qr.url;
    link.download = `QR_ID_${qr.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (qr) => {
    try {
      const response = await fetch(qr.url);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${qr.id}.png`, { type: blob.type });

      const shareData = {
        files: [file],
        title:  'QR Code with ID',
        text: qr.id,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(qr.id);
        setSnackbar({ open: true, message: 'File sharing not supported. ID copied instead!' });
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
      setSnackbar({ open: true, message: 'Error: Could not share QR code.' });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            All Generated QR Codes
          </Typography>
          {qrs.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </Box>

        {qrs.length === 0 ? (
          <Alert severity="info">
            You haven't generated any QR codes yet. Go to the{' '}
            <MuiLink component={RouterLink} to="/create">
              generator
            </MuiLink>{' '}
            to create some!
          </Alert>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {qrs.map((qr) => (
              <Grid item key={qr.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ wordBreak: 'break-all' }}>
                  <CardMedia
                    component="img"
                    image={qr.url}
                    alt="Generated QR Code"
                    sx={{ padding: 2 }}
                  />
                  <CardContent>
                    <Typography variant="caption" display="block" gutterBottom>
                      Unique ID:
                    </Typography>
                    <Typography variant="body2" component="div">
                      {qr.id}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton onClick={() => handleDownload(qr)} aria-label="download qr code">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleShare(qr)} aria-label="share qr code">
                      {navigator.share ? <ShareIcon /> : <ContentCopyIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <MuiLink component={RouterLink} to="/home" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
          Go back to Homepage
        </MuiLink>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QRList;
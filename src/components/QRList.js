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
  CircularProgress,
  Stack,
  IconButton,
  Snackbar,
} from '@mui/material';
// import { styled } from '@mui/material/styles'; // No longer needed
// import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// The StatusBadge is removed as the 'status' property does not exist on the QR code model.

const QRList = () => {
  const [qrs, setQrs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQRs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://backendqrscan-uhya.vercel.app/api/qrcodes`);
        if (!response.ok) {
          throw new Error('Could not fetch QR codes');
        }
        const responseData = await response.json();
        // Correctly access the nested qrCodes array from the backend response
        setQrs(responseData.data.qrCodes || []);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setSnackbar({ open: true, message: 'Could not fetch QR codes from server.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchQRs();
  }, []);

  // const handleClearAll = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/qrcodes', { method: 'DELETE' });
  //     if (!response.ok) {
  //       throw new Error('Failed to clear QR codes.');
  //     }
  //     setQrs([]);
  //     setSnackbar({ open: true, message: 'All QR codes have been cleared.' });
  //   } catch (error) {
  //     console.error('Error clearing QR codes:', error);
  //     setSnackbar({ open: true, message: 'Error: Could not clear QR codes.' });
  //   }
  // };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print All QR Codes</title>');
      printWindow.document.write(`
        <style>
          @media print {
            @page { size: auto; margin: 0mm; }
            body { margin: 0; font-family: sans-serif; }
            .page-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              page-break-after: always;
            }
            .page-container:last-child { page-break-after: auto; }
            img {
              max-width: 70%;
              max-height: 70%;
              object-fit: contain;
            }
            .qr-id {
              font-family: 'Courier New', Courier, monospace;
              font-size: 14px;
              color: #333;
              margin-top: 20px;
              word-break: break-all;
            }
          }
        </style>
      `);
      printWindow.document.write('</head><body>');

      qrs.forEach((qr) => {
        // The image from qr.url already contains the ID.
        // We just need to embed it in the page.
        printWindow.document.write(`
          <div class="page-container">
            <img src="${qr.url}" alt="QR Code with ID ${qr.id}" />
          </div>
        `);
      });

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      // Use a small timeout to ensure content is rendered before printing
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
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
        setSnackbar({ open: true, message: 'File sharing not supported. ID copied instead!', severity: 'info' });
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
      setSnackbar({ open: true, message: 'Error: Could not share QR code.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            All Generated QR Codes ({qrs.length})
          </Typography>
          {qrs.length > 0 && ( // Only show buttons if there are QRs
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintAll}
              >
                Print All
              </Button>
              {/* <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
              >
                Clear All
              </Button> */}
            </Stack>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          qrs.length === 0 ? (
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
                <Grid item key={qr._id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ wordBreak: 'break-all', position: 'relative' }}>
                    {/* StatusBadge removed as 'status' is not a property of the QR code model */}
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
          )
        )}

        <MuiLink component={RouterLink} to="/home" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
          Go back to Homepage
        </MuiLink>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QRList;

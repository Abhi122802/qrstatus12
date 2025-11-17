import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link as MuiLink,
  CircularProgress,
  CardActions,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useApi } from './api';

const CreateQR = () => {
  const api = useApi();
  const [qrs, setQrs] = useState([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generateQRCode = async () => {
    const numToGenerate = parseInt(count, 10) || 1;
    if (numToGenerate < 1) {
      setCount(1); // Reset to 1 if input is invalid
      return;
    }

    setLoading(true);
    const generatedQRs = [];
    try {
      for (let i = 0; i < numToGenerate; i++) {
        const id = uuidv4();
        // Generate QR code as a data URL
        const qrCodeDataUrl = await QRCode.toDataURL(id, { width: 256, margin: 2 });

        // Create a canvas to draw the QR code and the ID text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise(resolve => {
          img.onload = () => {
            // Set canvas dimensions
            const padding = 20;
            const fontSize = 14;
            canvas.width = img.width;
            canvas.height = img.height + padding + fontSize;

            // Draw the QR code image
            ctx.drawImage(img, 0, 0);

            // Draw the ID text below the QR code
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(id, canvas.width / 2, img.height + padding);
            resolve();
          };
          img.src = qrCodeDataUrl;
        });

        generatedQRs.push({ id, url: canvas.toDataURL('image/png'), status: 'inactive' });
      }
      setQrs(generatedQRs);

      // Save to MongoDB via backend API
      const response = await api('/qrcodes', {
        method: 'POST',
        body: JSON.stringify(generatedQRs),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error!');
      }

    } catch (err) {
      if (err.message !== 'Unauthorized') {
        console.error('Error generating QR code(s):', err);
        setSnackbar({ open: true, message: 'Error saving QR codes to server.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (qr) => {
    const printWindow = window.open('', '_blank', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print QR Code</title>');
      printWindow.document.write('<style>body { text-align: center; margin-top: 50px; } img { max-width: 90%; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<img id="print-image" src="${qr.url}" />`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();

      const printImage = printWindow.document.getElementById('print-image');

      // Wait for the image to load before triggering the print dialog
      printImage.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } else {
      alert('Please allow popups for this website to print the QR code.');
    }
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print All QR Codes</title>');
      printWindow.document.write(`
        <style>
          body { text-align: center; margin: 0; }
          .page {
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            page-break-after: always;
          }
          .page:last-child { page-break-after: auto; }
          img { max-width: 80%; max-height: 80%; }
        </style>
      `);
      printWindow.document.write('</head><body>');

      const imageLoadPromises = qrs.map((qr, index) => {
        printWindow.document.write(`<div class="page"><img id="print-image-${index}" src="${qr.url}" /></div>`);
        const img = printWindow.document.getElementById(`print-image-${index}`);
        return new Promise(resolve => { img.onload = resolve; });
      });

      printWindow.document.write('</body></html>');
      printWindow.document.close();

      // Wait for all images to load before printing
      Promise.all(imageLoadPromises).then(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      });
    } else {
      alert('Please allow popups for this website to print the QR codes.');
    }
  };

  const handleShare = async (qr) => {
    try {
      // Convert data URL to a File object to be shared
      const response = await fetch(qr.url);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${qr.id}.png`, { type: blob.type });

      const shareData = {
        files: [file],
        title: 'QR Code with ID', // Title for the share sheet
        text: qr.id,      // The ID will be the body of the message
      };

      if (navigator.share && navigator.canShare(shareData)) {
        // Use Web Share API to share the file
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support sharing files
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
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Generator
        </Typography>
        <Typography>
          Enter the number of QR codes to generate and click the button.
        </Typography>
        <Box
          component="form"
          sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}
          noValidate
          autoComplete="off"
        >
          <TextField
            id="qr-count"
            label="Number of QR Codes"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ width: '200px' }}
          />
          <Button variant="contained" onClick={generateQRCode} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </Box>

        {qrs.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5" component="h2">
                Your QR Code(s)
              </Typography>
              {qrs.length > 1 && (
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrintAll}>
                  Print All
                </Button>
              )}
            </Box>
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
                      <IconButton onClick={() => handlePrint(qr)} aria-label="print qr code">
                        <PrintIcon />
                      </IconButton>
                      <IconButton onClick={() => handleShare(qr)} aria-label="share qr code">
                        {navigator.share ? <ShareIcon /> : <ContentCopyIcon />}
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        <MuiLink component={RouterLink} to="/home" sx={{ display: 'block', mt: 4 }}>
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

export default CreateQR;
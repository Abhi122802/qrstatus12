import React, { useState, } from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
import useApi from './api';

const CreateQR = () => {
  const api = useApi();
  const [qrs, setQrs] = useState([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

        // Save to MongoDB via backend API
        const response = await api("/qrcodes", {
          method: 'POST',
          body: JSON.stringify({ data: id }), // Send the ID to be encoded
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Server responded with an error!');
        }

        const { id: qrId, url: qrUrl } = responseData;

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

            // Fill the background with white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the QR code image
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Draw the ID text below the QR code
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(qrId, canvas.width / 2, img.height + padding);
            resolve();
          };
          img.src = qrUrl; // Use URL from backend response
        });

        generatedQRs.push({ id: qrId, url: canvas.toDataURL('image/png'), status: 'inactive' });
      }
      setQrs(generatedQRs);
      setSnackbar({ open: true, message: `${numToGenerate} QR Code(s) created successfully!`, severity: 'success' });

    } catch (err) {
      console.error('Error generating QR code(s):', err);
      setSnackbar({ open: true, message: err.message || 'Error saving QR codes to server.', severity: 'error' });
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
      // The URL is a data URL, so we can convert it to a blob directly
      // without fetching.
      const res = await fetch(qr.url);
      const blob = await res.blob();
      const file = new File([blob], `qr-code-${qr.id}.png`, { type: 'image/png' });

      // This check is important. If for any reason the qr.url is undefined,
      // the fetch above would fail and we'd get a proxy error.
      // Let's add a check to be safe, similar to what we did in QRList.js
      if (!qr.url) {
        setSnackbar({ open: true, message: 'QR code URL is missing.', severity: 'error' });
        return;
      }

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
        autoHideDuration={4000}
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

export default CreateQR;

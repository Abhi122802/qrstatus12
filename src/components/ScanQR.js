import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Container,
  Box,
  Typography,
  Alert,
  Button,
  Link as MuiLink,
  Paper,
  CircularProgress,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

const ScanQR = () => {
  const { action } = useParams(); // This will be 'activate' or 'deactivate'
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader', // ID of the div to render the scanner
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5, // Scans per second
      },
      false // verbose
    );

    const handleScanSuccess = async (decodedText) => {
      // Stop scanning after a successful scan.
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on success", err));
      }
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/qrcodes/${decodedText}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: action }),
        });
        if (!response.ok) {
          // Check if the response is JSON before trying to parse it
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status.');
          } else {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
      setShowScanner(false);
      setScanResult(decodedText);
      // Here you would typically make an API call to your backend
      // For example: api.post(`/qrcodes/${decodedText}/${action}`);
    };

    const onScanError = (errorMessage) => {
      // This error is often a benign "QR code not found" message, so we can ignore it.
      // We can add more specific error handling here if needed.
    };

    // Start scanning. The scanner will be cleared by the cleanup function.
    // The render method doesn't return a promise. We handle success and error via callbacks.
    // We'll assume initialization is fast and set loading to false right away.
    // The scanner UI itself will show a loading state if camera access is slow.
    try {
      scanner.render(handleScanSuccess, onScanError);
      setLoading(false);
    } catch (err) {
      setError(`Camera Error: ${err.message}. Please grant camera permissions and refresh.`);
      setLoading(false);
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      // This check is important to prevent errors if the scanner is already cleared.
      if (scanner && scanner.getState() === 2 /* SCANNING */) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount.", err));
      }
    };
  }, [showScanner, action]);

  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    setLoading(true);
    setShowScanner(true);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Scan to {action}
          </Typography>

          {loading && (
            <Box sx={{ my: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 1 }}>Initializing Camera...</Typography>
            </Box>
          )}

          <Box sx={{ display: showScanner && !loading ? 'block' : 'none' }}>
            <div id="qr-reader" style={{ width: '100%' }}></div>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {scanResult && (
            <Box>
              {!error && (
                <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography><strong>Success!</strong></Typography>
                  <Typography sx={{ wordBreak: 'break-all' }}>
                    QR Code ID: <strong>{scanResult}</strong>
                  </Typography>
                  <Typography>
                    Status has been set to <strong>{action}</strong>.
                  </Typography>
                </Alert>
              )}
              <Button variant="contained" startIcon={<ReplayIcon />} onClick={handleScanAgain} sx={{ mt: 3 }}>
                Scan Another
              </Button>
            </Box>
          )}
        </Paper>

        <MuiLink component={RouterLink} to="/home" sx={{ display: 'block', mt: 4 }}>
          Go back to Homepage
        </MuiLink>
      </Box>
    </Container>
  );
};

export default ScanQR;
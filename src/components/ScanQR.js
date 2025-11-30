import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
import useApi from './api';

const ScanQR = () => {
  const { action } = useParams(); // This will be 'activate' or 'deactivate'
  const api = useApi();
  const [scanResult, setScanResult] = useState(null);
  const [scanResponseUrl, setScanResponseUrl] = useState(null); // To store URL from backend
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showScanner) return;

    // This check prevents re-initializing the scanner if it's already been rendered.
    if (document.getElementById('qr-reader-placeholder')?.innerHTML) {
        setLoading(false);
        return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader-placeholder', // Use a placeholder ID
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
      
      setShowScanner(false);
      setScanResult(decodedText); // Store the raw scanned URL
      setLoading(true); // Show loader while we talk to the backend

      try {
        // Call the NEW backend endpoint to record the scan
        const response = await api(`/scan`, {
          method: 'POST',
          // Send the full scanned URL to the backend
          body: JSON.stringify({ scannedUrl: decodedText }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Now we know it's a JSON error response from our backend
          throw new Error(result.message || 'Failed to record scan.');
        }
        
        // Save the destination URL from the backend response
        if (result.data && result.data.destinationUrl) {
          setScanResponseUrl(result.data.destinationUrl);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const onScanError = (errorMessage) => {
      // This error is often a benign "QR code not found" message, so we can ignore it.
    };

    try {
      scanner.render(handleScanSuccess, onScanError);
      setLoading(false);
    } catch (err) {
      setError(`Camera Error: ${err.message}. Please grant camera permissions and refresh.`);
      setLoading(false);
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (scanner && scanner.getState() === 2 /* SCANNING */) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount.", err));
      }
    };
  }, [showScanner, action, navigate, api]);

  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    setLoading(true);
    setShowScanner(true);
    setScanResponseUrl(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Scan QR Code
          </Typography>

          {(loading && !scanResult) && (
            <Box sx={{ my: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 1 }}>Initializing Camera...</Typography>
            </Box>
          )}

          <Box sx={{ display: showScanner && !loading ? 'block' : 'none' }}>
            {/* Use a placeholder div to avoid re-rendering issues */}
            <div id="qr-reader-placeholder" style={{ width: '100%' }}></div>
          </Box>

          {scanResult && (
            <Box>
              {loading ? (
                <Box sx={{ my: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 1 }}>Verifying QR Code...</Typography>
                </Box>
              ) : error ? (
                 <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography><strong>Scan Failed!</strong></Typography>
                    <Typography sx={{ wordBreak: 'break-all' }}>
                      Scanned Data: <strong>{scanResult}</strong>
                    </Typography>
                    <Typography>
                      Error: {error}
                    </Typography>
                 </Alert>
              ) : (
                <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography><strong>Success!</strong></Typography>
                  <Typography>
                    Status has been recorded as <strong>scanned</strong>.
                  </Typography>
                  {scanResponseUrl && (
                     <Typography>
                        Redirect URL: <MuiLink href={scanResponseUrl} target="_blank" rel="noopener">{scanResponseUrl}</MuiLink>
                     </Typography>
                  )}
                </Alert>
              )}
              <Button variant="contained" startIcon={<ReplayIcon />} onClick={handleScanAgain} sx={{ mt: 3 }} disabled={loading}>
                Scan Another
              </Button>
            </Box>
          )}

          {error && !scanResult && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
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

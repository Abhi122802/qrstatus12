import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { saveAs } from 'file-saver'; // We'll use this library to save the file
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
  const [scanLog, setScanLog] = useState([]); // State to hold all scanned data
  const navigate = useNavigate();

  useEffect(() => {
    if (!showScanner) return;

    // This check prevents re-initializing the scanner if it's already been rendered.
    if (document.getElementById('qr-reader-placeholder')?.innerHTML) {
        setLoading(false);
        return;
    }

    // Load existing scan log from localStorage on initial mount
    const savedLog = localStorage.getItem('scanLog');
    if (savedLog) {
      setScanLog(JSON.parse(savedLog));
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

    const handleScanSuccess = (decodedText) => {
      // Stop scanning after a successful scan.
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on success", err));
      }

      // --- New Logic to append to the log ---
      const status = action || 'scanned';
      let qrId = decodedText;
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        const potentialId = pathParts[pathParts.length - 1];
        if (potentialId.length > 30) {
          qrId = potentialId;
        }
      } catch (e) {
        console.log("Scanned data is not a URL, using raw text as ID.");
      }

      const newEntry = { id: qrId, status: status, timestamp: new Date().toISOString() };

      setScanLog(prevLog => {
        const updatedLog = [...prevLog, newEntry];
        // Save the updated log to localStorage
        localStorage.setItem('scanLog', JSON.stringify(updatedLog));
        return updatedLog;
      });

      setShowScanner(false);
      setScanResult(decodedText); // Store the raw scanned URL
      // We are no longer making a backend call, so we can stop the loading state.
      setLoading(false);
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

  const handleDownloadLog = () => {
    if (scanLog.length === 0) {
      alert("No scans have been logged yet.");
      return;
    }

    // Convert the log array to a CSV string
    const header = "ID,Status,Timestamp\n";
    const csvRows = scanLog.map(entry => `${entry.id},${entry.status},${entry.timestamp}`).join("\n");
    const csvContent = header + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'scan_log.csv');
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
              {scanLog.length > 0 && (
                <Button variant="outlined" onClick={handleDownloadLog} sx={{ mt: 3, ml: 2 }}>
                  Download Log ({scanLog.length} scans)
                </Button>
              )}
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

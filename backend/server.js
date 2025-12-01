const express = require('express');
const cors = require('cors');
const { put, head, del } = require('@vercel/blob');

const app = express();
// const PORT = 5001; // We'll use a different port from the React dev server

// Middleware
app.use(cors()); // Allow requests from your React frontend
app.use(express.json()); // To parse JSON request bodies

const BLOB_FILENAME = 'scan_log.csv';

// The endpoint that will receive the scan data
app.post('/api/log-scan', async (req, res) => {
  const { id, status, timestamp } = req.body;

  if (!id || !status || !timestamp) {
    return res.status(400).json({ message: 'Missing required scan data.' });
  }

  try {
    let existingContent = '';
    // Check if the blob already exists
    const blobInfo = await head(BLOB_FILENAME).catch(err => null);

    if (blobInfo) {
      // If it exists, fetch its content
      const blobResponse = await fetch(blobInfo.url);
      existingContent = await blobResponse.text();
    } else {
      // If it doesn't exist, start with a header
      existingContent = 'ID,Status,Timestamp\n';
    }

    // Append the new row
    const newCsvRow = `${id},${status},${timestamp}\n`;
    const updatedContent = existingContent + newCsvRow;

    // Upload the updated content back to Vercel Blob, overwriting the old one
    await put(BLOB_FILENAME, updatedContent, { access: 'public' });

    res.status(200).json({ message: 'Scan logged successfully.' });
  } catch (error) {
    console.error('Failed to write to Vercel Blob:', error);
    return res.status(500).json({ message: 'Failed to log scan on the server.' });
  }
});

// Add a new route handler for login
app.post('/api/auth/login', (req, res) => {
  // Note: You'll need to add your authentication logic here.
  // This is just a placeholder example.
  const { email, password } = req.body;

  if (email === 'admin@example.com' && password === 'password') { // Example credentials
    return res.status(200).json({ message: 'Login successful!', token: 'your-jwt-token' });
  }
  return res.status(401).json({ message: 'Invalid credentials.' });
});

/*
 * The app.listen() is not needed for Vercel.
 * Vercel will handle the server creation. We just need to export the app.
 */
module.exports = app;
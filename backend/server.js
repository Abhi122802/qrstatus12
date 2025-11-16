// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Connection ---
// Replace '<your_mongodb_connection_string>' with your actual MongoDB connection string.
// For local development, it might be 'mongodb://localhost:27017/your-db-name'
const MONGO_URI ='mongodb+srv://r23288119_db_user:XGjaBPcOy9wX5jG6@cluster0.lrxqbnw.mongodb.net/firstapp?appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/qrcodes', require('./routes/qrcodes'));

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

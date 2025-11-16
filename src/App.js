import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Homepage from './components/homepage';
import CreateQR from './components/CreateQR';
import ScanQR from './components/ScanQR';
import QRList from './components/QRList';
import theme from './components/theme';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              {/* <Route path="/" element={<Homepage />} /> */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/create" element={<CreateQR />} />
              <Route path="/scan/:action" element={<ScanQR />} />
              <Route path="/list" element={<QRList />} />
            </Routes>
          </header>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

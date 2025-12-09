import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import CustomerDetail from './components/CustomerDetail';
import Interactions from './components/Interactions';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <PrivateRoute>
                    <Customers />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/customers/:id" 
                element={
                  <PrivateRoute>
                    <CustomerDetail />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/interactions" 
                element={
                  <PrivateRoute>
                    <Interactions />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">CRM System</div>
        {user ? (
          <div className="navbar-links">
            <Link to="/">Dashboard</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/interactions">Interactions</Link>
            <span>Welcome, {user.username}!</span>
            <button onClick={handleLogout} className="btn">Logout</button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
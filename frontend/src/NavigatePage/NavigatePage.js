import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigatePage = () => {
  const navigate = useNavigate(); // Hook for navigation

  // Define the clearCookie function
  const clearCookie = () => {
    // Clear the cookie by setting its expiration to a past date
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; 
    // Optionally, you can log the result or redirect the user after logout
    console.log("Cookie cleared");

    // You can also navigate to a different page, such as the login page
    // navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Choose an action:</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/signup')}>Go to Signup</button>
        <button onClick={() => navigate('/login')}>Go to Login</button>
        <button onClick={() => navigate('/rent')}>Go to Rent</button>
        <button onClick={() => navigate('/admin')}>Go to Admin</button>
        <button onClick={() => navigate('/addgame')}>Go to Add Game</button>
        {/* Logout button that triggers clearCookie */}
        <button onClick={clearCookie}>Logout</button>
      </div>
    </div>
  );
};

export default NavigatePage;
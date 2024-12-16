import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigatePage = () => {
  const navigate = useNavigate(); // Hook do nawigacji

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
      </div>
    </div>
  );
};

export default NavigatePage;

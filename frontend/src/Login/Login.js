import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { getJwtToken, setJwtToken } from '../utils/clearJwtToken.js';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setIsAdmin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // hook do nawigacji

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Login successful! Welcome ${data.name}`);

        // Pobierz token po udanym logowaniu
        const token = getJwtToken();
        console.log('Decoded Token:', token); // Sprawdzamy token w konsoli

        // Dekodowanie tokenu
        const decoded = jwtDecode(token);
        console.log('Decoded JWT:', decoded); // Sprawdzamy dekodowanie

        // Ustawiamy, czy użytkownik jest adminem
        setIsAdmin(decoded.status === 1);

        // Przekierowanie po udanym logowaniu
        navigate('/');
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to login.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow p-4" style={{ width: '400px', borderRadius: '10px' }}>
        <h2 className="text-center mb-4" style={{ color: '#343a40' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Email"
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Password"
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        {message && <p className="mt-3 text-center text-danger">{message}</p>}
      </div>
    </div>
  );
};

export default Login;

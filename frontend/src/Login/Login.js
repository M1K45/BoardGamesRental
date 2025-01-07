import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { getJwtToken, setJwtToken } from '../utils/clearJwtToken.js';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const Login = ({ setIsAdmin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [pendingNotifications, setPendingNotifications] = useState([]);

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // hook do nawigacji

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNotifications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/pending/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      // console.log('dane pobrane na potrzeby powiadomienia: ', data);
      // console.log('data.length: ',data.length);
      if (data.length > 0) {
        setPendingNotifications(data); // Ustawiamy dane o zaległych terminach
        // console.log('pending modification: ', pendingNotifications.length);
      } else {
        // setMessage('No rented games found for this user.'); // Obsługa pustych wyników
      }
    } catch (error) {
      console.error('Error fetching overdues:', error);
      setMessage('Error: Unable to fetch overdues .');
    }
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   try {
  //     const response = await fetch('http://localhost:5000/login', {
  //       method: 'POST',
  //       credentials: 'include',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     });
  
  //     if (response.ok) {
  //       const data = await response.json();
  //       setMessage(`Login successful! Welcome ${data.name}`);
  
  //       // Pobierz token po udanym logowaniu
  //       const token = getJwtToken();
  //       console.log('Decoded Token:', token); // Sprawdzamy token w konsoli
  
  //       // Dekodowanie tokenu
  //       const decoded = jwtDecode(token);
  //       console.log('Decoded JWT:', decoded); // Sprawdzamy dekodowanie
  
  //       // Ustawiamy, czy użytkownik jest adminem
  //       setIsAdmin(decoded.status === 1);
        
  //       await handleNotifications(decoded.id);
  //       alert(pendingNotifications.length);
  //       navigate('/');
  //     } else {
  //       // Obsługa błędów
  //       const errorData = await response.json();
  //       if (errorData.message === 'Invalid email or password.') {
  //         setMessage('Nie udało się zalogować. Sprawdź swoje dane lub załóż konto.');
  //       } else {
  //         setMessage('Wystąpił nieznany błąd. Spróbuj ponownie później.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     setMessage('Nie udało się połączyć z serwerem. Spróbuj ponownie później.');
  //   }
  // };



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
  
        // Fetch notifications after successful login
        await handleNotifications(decoded.id);
  
        // Now trigger the alert after pendingNotifications has been updated
        // The effect below will handle this for you
        navigate('/');
      } else {
        // Obsługa błędów
        const errorData = await response.json();
        if (errorData.message === 'Invalid email or password.') {
          setMessage('Nie udało się zalogować. Sprawdź swoje dane lub załóż konto.');
        } else {
          setMessage('Wystąpił nieznany błąd. Spróbuj ponownie później.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Nie udało się połączyć z serwerem. Spróbuj ponownie później.');
    }
  };
  
  useEffect(() => {
    if (pendingNotifications.length > 0) {
      alert(`You have ${pendingNotifications.length} game(s) to return in recent days`);
    }
  }, [pendingNotifications]);  // This effect runs whenever pendingNotifications changes
  

  return (
    <div
    className="d-flex justify-content-center align-items-center vh-100"
    style={{
      backgroundImage: `url('/images/123.webp')`, // Poprawiona ścieżka
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
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
          <button type="submit" className="btn btn-light-green w-100">Login</button>
        </form>
        {message && <p className="mt-3 text-center text-danger">{message}</p>}
        <div className="text-center mt-3">
        <p className="signup-link">
        Don't have an account?
        <a href="/signup" className="text-muted">Sign up here</a>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

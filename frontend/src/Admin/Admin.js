import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';


const Admin = ({ setIsAdmin }) => {
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  

  // Fetch all rentals
  const fetchRentals = async () => {
    try {
      const response = await fetch('http://localhost:5000/rentals');
      const data = await response.json();
      setRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  // Handle Pending Status
  const handlePending = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage('Rental updated to Pending.');
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error updating rental to Pending.');
      }
    } catch (error) {
      console.error('Error updating rental:', error);
    }
  };

  // Handle End Status
  const handleEnd = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/end`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage('Rental ended and game set to Available.');
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error ending rental.');
      }
    } catch (error) {
      console.error('Error ending rental:', error);
    }
  };
  
    const handleLogout = () => {
      clearJwtToken();  // Wywołanie funkcji kasującej token
      console.log('Wylogowano');
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/'); 
      // Dodatkowe logowanie użytkownika, np. przekierowanie do strony logowania
    };

  useEffect(() => {
    console.log('strona admina');
    fetchRentals();
    const token = getJwtToken();
    if (token) {
      setIsAuthenticated(true);  // Jeśli token istnieje, ustawiamy, że użytkownik jest zalogowany
      // console.log('token: ', token);
      const decoded = jwtDecode(token);
      // console.log('decoded token: ', decoded.name);
      setUsername(decoded.name);
      navigate('/');
    }
    else {
      setIsAuthenticated(false);  // Jeśli tokenu brak, ustawiamy, że użytkownik nie jest zalogowany
    }
  }, []);

  const navigate = useNavigate(); // hook do nawigacji

  return (
    <div>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate('/rent')}>Rent a game</button>
        
        <button onClick={() => navigate('/addgame')}>Add Game</button>
        <button onClick={() => navigate('/manage-games')}>Manage games</button>
        <button onClick={() => navigate('/users')}>Users</button>

      <h2>Admin: Rentals Management</h2>
      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Rental ID</th>
            <th>User ID</th>
            <th>Game ID</th>
            <th>Game Title</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental) => (
            <tr key={rental.rentalid}>
              <td>{rental.rentalid}</td>
              <td>{rental.userid}</td>
              <td>{rental.gameid}</td>
              <td>{rental.title}</td>
              <td>{new Date(rental.enddate).toLocaleString()}</td>
              <td>{rental.returnstatus}</td>
              <td>
                <button onClick={() => handlePending(rental.rentalid)}>Set Pending</button>
                <button onClick={() => handleEnd(rental.rentalid)}>Set End</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;

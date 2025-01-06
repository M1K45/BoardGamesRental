import React, { useState, useEffect } from 'react';
import { getJwtToken } from '../utils/clearJwtToken'; // Funkcja do pobrania tokenu
import { useNavigate } from 'react-router-dom'; // Correct import
import { jwtDecode } from 'jwt-decode';

// to na razie nie działa 


const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentedData, setRentedData] = useState([]);
  const navigate = useNavigate(); // hook do nawigacji

  // Funkcja do pobrania danych użytkownika
  const fetchUserProfile = async () => {
    const token = getJwtToken();
    if(!token){
      navigate('/');
      return;
    }
    const decoded = jwtDecode(token); // Dekodowanie tokenu JWT, aby pobrać userId
    const userId = decoded.id;

    try {
      const response = await fetch(`http://localhost:5000/user-profile?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setUserData(data.user); // Ustawiamy dane użytkownika w stanie
      } else {
        setMessage(data.message); // Obsługa błędów
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch user profile.');
    } finally {
      setLoading(false); // Ustawiamy loading na false po zakończeniu ładowania danych
    }
  };

  const fetchRented = async () => {
    const token = getJwtToken();
    if(!token){
      navigate('/');
      return;
    }
    const decoded = jwtDecode(token); // Dekodowanie tokenu JWT, aby pobrać userId
    const userId = decoded.id;

    try {
      const response = await fetch(`http://localhost:5000/reserved-profile?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setRentedData(data.user); // Ustawiamy dane użytkownika w stanie
      } else {
        setMessage(data.message); // Obsługa błędów
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch user profile.');
    } finally {
      setLoading(false); // Ustawiamy loading na false po zakończeniu ładowania danych
    }
  };

  // Wykonujemy fetch po załadowaniu komponentu
  useEffect(() => {
    fetchUserProfile();
    fetchRented();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Pokazujemy loader, jeśli dane jeszcze się ładują
  }

  // Jeżeli wystąpił błąd, pokazujemy komunikat
  if (message) {
    return <div>{message}</div>;
  }

  
  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {userData ? (
        <div>
          <h2>{userData.name}</h2>
          <p>Email: {userData.email}</p>

          <h3>Rented Games:</h3>
          {rentedData.rentedGames.length > 0 ? (
            <ul>
              {rentedData.rentedGames.map((game, index) => (
                <li key={index}>
                  <h4>{game.title}</h4>
                  <p>Theme: {game.theme}</p>
                  <p>Players: {game.players}</p>
                  <p>Difficulty: {game.difficulty}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No games rented yet.</p>
          )}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;

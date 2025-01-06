import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import "./Rent.css"
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';


const RentGame = ({ isAdmin }) => {
  const [games, setGames] = useState([]);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch available games from the server
  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/available-games');
      if (response.ok) {
        const data = await response.json();
        setGames(data); 
        // console.log(data);
      } else {
        setMessage('Error fetching games.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch games.');
    }
  };

  
  const handleLogout = () => {
    clearJwtToken();  // Wywołanie funkcji kasującej token
    console.log('Wylogowano');
    setIsAuthenticated(false); 
    // Dodatkowe logowanie użytkownika, np. przekierowanie do strony logowania
  };

  useEffect(() => {
    console.log('strona rent - dla usera i niezalogowanych');
    fetchGames();
    const token = getJwtToken();
    if (token) {
      setIsAuthenticated(true);  // Jeśli token istnieje, ustawiamy, że użytkownik jest zalogowany
      // console.log('token: ', token);
      const decoded = jwtDecode(token);
      // console.log('decoded token: ', decoded.name);
      setUsername(decoded.name);
      
      //==========================================================================
      // TO FRAGMENT ODPOWIEDZIALNY ZA WYPOŻYCZENIE GRY AUTOMATYCZNIE PO ZALOGOWANIU, 
      // NIE WIEM, CZEMU NIE DZIAŁA 

      // Check for pending rental after successful authentication
      const pendingGameId = localStorage.getItem('pendingGameId');
      // console.log('to coo chceldfad: ', localStorage.getItem('pendingGameId'));
      // localStorage.removeItem('pendingGameId');
      // console.log('to po usuniecu: ', localStorage.getItem('pendingGameId'));

      if (pendingGameId) {
        localStorage.removeItem('pendingGameId'); // Clean up
        handleRent(pendingGameId); // Resume rental
        console.log('to co zostąło po rzekomym usunieciu: ',localStorage.getItem('pendingGameId'));
      }
      //==========================================================================
    }
     else {
      setIsAuthenticated(false);  // Jeśli tokenu brak, ustawiamy, że użytkownik nie jest zalogowany
  }
}, []);




  // Handle rent game action
  const handleRent = async (gameId) => {
    
    if (!isAuthenticated){
      localStorage.setItem('pendingGameId', gameId);
      console.log()
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/rent', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, game_id: gameId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Rental successful! Rental ID: ${data.rental.rentalid}`);
        fetchGames(); // Refresh available games after successful rent
      } else {
        const errorText = await response.json();
        setMessage(`Error: ${errorText.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to process rental.');
    }
  };

  const navigate = useNavigate(); // hook do nawigacji
  return (
    <div>
      <h2>Welcome to our rental!</h2>
      <h3>Here is our offer:</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
  {!isAuthenticated ? (
    <div  className="d-flex justify-content-end ms-auto">
      <button className="btn btn-primary me-2" onClick={() => navigate('/signup')}>Signup</button>
      <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
    </div>
  ) : (
    <div>
      <p>You are logged in as: {username}</p>
      {isAdmin && <button className="btn btn-warning me-2" onClick={() => navigate('/admin')}>Go to Admin Page</button>}
      <button className="btn btn-info me-2" onClick={() => navigate('/profile')}>Profile</button>
      <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    </div>
  )}
</div>

      <div>
        {games.length > 0 ? (
          games.map((game) => (
            <div key={game.gameid} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{game.title}</h3>
              <p><strong>Theme:</strong> {game.theme}</p>
              <p><strong>Players:</strong> {game.players}</p>
              <p><strong>Difficulty:</strong> {game.difficulty}</p>
              <p>{game.description}</p>
              {game.image_url && (
            <img
              src={game.image_url}
              style={{ width: "200px", height: "auto" }}
            />
          )}
              <button onClick={() => handleRent(game.gameid)}>Rent</button>
            </div>
          ))
        ) : (
          <p>No available games at the moment.</p>
        )}
      </div>
      {message && <p>{message}</p>}
    
    </div>
  );
};

export default RentGame;

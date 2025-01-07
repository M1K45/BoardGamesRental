import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import "./Rent.css"
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';
import { Modal } from 'react-bootstrap';
import Footer from '../utils/footer';


const RentGame = ({ isAdmin }) => {
  const [games, setGames] = useState([]);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleShowModal = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  // Fetch available games from the server
  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/available-games');
      if (response.ok) {
        const data = await response.json();
        setGames(data); 
        console.log(data);
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
      console.log('token: ', token);
      const decoded = jwtDecode(token);
      console.log('decoded token: ', decoded.name);
      setUsername(decoded.name);
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
  <div className="container my-4">
    <div className="d-flex align-items-center justify-content-between mb-4">
  <div>
    <h2 className="text-start mb-0">Welcome to our rental!</h2>
    <h3 className="text-start">Here is our offer:</h3>
  </div>
  <div className="d-flex align-items-center">
    {!isAuthenticated ? (
      <>
        <button className="btn btn-primary me-2" onClick={() => navigate('/signup')}>
          Signup
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Login
        </button>
      </>
    ) : (
      <>
        <p className="me-3 mb-0">You are logged in as: <strong>{username}</strong></p>
        {isAdmin && (
          <button 
            className="btn btn-warning me-2" 
            onClick={() => navigate('/admin')} 
            style={{ width: '200px', whiteSpace: 'nowrap', textAlign: 'center' }}
          >
            Back to Admin Page
          </button>
        )}
        <button className="btn btn-info me-2" onClick={() => navigate('/profile')}>
          Profile
        </button>
        <button className="btn btn-danger text-center" onClick={handleLogout}>
          Logout
        </button>
      </>
    )}
  </div>
</div>

<div className="row">
  {games.length > 0 ? (
    games.map((game) => (
      <div key={game.gameid} className="col-md-4 mb-4">
        <div
          className="card h-100"
          style={{ cursor: 'pointer' }}
          onClick={() => handleShowModal(game)}
        >
          {game.image_url && (
            <img
              src={game.image_url}
              className="card-img-top"
              alt={game.title}
              style={{ objectFit: 'contain', maxHeight: '200px' }}
            />
          )}
          <div className="card-body text-center">
            <h5 className="card-title">{game.title}</h5>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center">No available games at the moment.</p>
  )}
</div>
<Modal show={showModal} onHide={handleCloseModal} centered>
  <Modal.Header closeButton>
    <Modal.Title>{selectedGame?.title}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedGame?.image_url && (
      <img
        src={selectedGame.image_url}
        className="img-fluid mb-3"
        alt={selectedGame.title}
      />
    )}
    <p><strong>Theme:</strong> {selectedGame?.theme}</p>
    <p><strong>Players:</strong> {selectedGame?.players}</p>
    <p><strong>Difficulty:</strong> {selectedGame?.difficulty}</p>
    <p>{selectedGame?.description}</p>
  </Modal.Body>
  <Modal.Footer>
    <button className="btn btn-secondary" onClick={handleCloseModal}>
      Close
    </button>
    <button
      className="btn btn-success"
      onClick={() => {handleRent(selectedGame?.gameid);
                      handleCloseModal(); 
      }}
    >
      Rent
    </button>
  </Modal.Footer>
</Modal>
    {message && <p className="text-center mt-4">{message}</p>}

    <Footer /> 
  </div>
);
};

export default RentGame;

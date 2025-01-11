import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Rent.css";
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';
import { Modal } from 'react-bootstrap';
import Footer from '../utils/footer';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const RentGame = ({ isAdmin }) => {
  const [games, setGames] = useState([]);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedType, setSelectedType] = useState('all'); // Filter state

  const handleShowModal = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/available-games');
      if (response.ok) {
        const data = await response.json();
        // console.log ("dane pobrane z backendu: ", data);
        setGames(data);
        console.log('games: ', games); 
      } else {
        setMessage('Error fetching games.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch games.');
    }
  };

  const handleLogout = () => {
    clearJwtToken();
    setIsAuthenticated(false); 
  };

  useEffect(() => {
    fetchGames();
    const token = getJwtToken();
    if (token) {
      setIsAuthenticated(true);
      const decoded = jwtDecode(token);
      setUsername(decoded.name);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleRent = async (gameId) => {
    if (!isAuthenticated) {
      localStorage.setItem('pendingGameId', gameId);
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
        fetchGames(); 
      } else {
        const errorText = await response.json();
        setMessage(`Error: ${errorText.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to process rental.');
    }
  };

  const navigate = useNavigate();

  const filteredGames = selectedType === 'all'
    ? games
    : games.filter((game) => game.theme === selectedType);

  return (
    <div className="container my-4">
      <div className='container-top'>
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
              {/* <p className="me-3 mb-0">You are logged in as: <strong>{username}</strong></p> */}
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
      </div>
      <div className="filter-buttons text-center mb-4">
        <button 
          className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-primary'} me-2 w-auto`}
          onClick={() => setSelectedType('all')}
        >
          All
        </button>
        <button
          className={`btn ${selectedType === 'Strategy' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('Strategy')}
        >
          Strategic
        </button>
        <button 
          className={`btn ${selectedType === 'economic' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('Economic')}
        >
          Economic
        </button>
        <button 
          className={`btn ${selectedType === 'economic' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('Cooperative')}
        >
          Cooperative
        </button>
        <button 
          className={`btn ${selectedType === 'economic' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('Card Games')}
        >
          Card Games
        </button>
        <button 
          className={`btn ${selectedType === 'economic' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('RPG')}
        >
          RPG
        </button>
        <button 
          className={`btn ${selectedType === 'economic' ? 'btn-success' : 'btn-outline-success'} me-2 w-auto`}
          onClick={() => setSelectedType('Dexterity')}
        >
          Dexterity
        </button>
      </div>

<div className="row">
  {filteredGames.length > 0 ? (
    filteredGames.map((game) => (
      <div key={game.gameid} className="col-md-4 mb-4">
        <div
          className="card h-100"
          style={{ cursor: 'pointer' }}
          onClick={() => handleShowModal(game)}
        >
          {game.primary_image && (
            <img
              src={game.primary_image}
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
    <p className="text-center">No games of this type available.</p>
  )}
</div>

<Modal show={showModal} onHide={handleCloseModal} centered>
  <Modal.Header closeButton>
    <Modal.Title>{selectedGame?.title}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  {selectedGame?.primary_image || selectedGame?.all_images?.length > 0 ? (
    <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {/* Sprawdzamy, czy zdjęcie priorytetowe istnieje i wyświetlamy je jako pierwsze */}
        {selectedGame.primary_image && (
          <div className="carousel-item active">
            <img
              src={selectedGame.primary_image}
              className="d-block w-100"
              alt="Primary game image"
              style={{ objectFit: 'contain', maxHeight: '300px' }}
            />
          </div>
        )}

        {/* Jeśli są inne zdjęcia, wyświetlamy je, ale nie jako zdjęcia priorytetowego */}
        {selectedGame.all_images?.length > 0 && selectedGame.primary_image && (
          selectedGame.all_images
            .filter(image => image !== selectedGame.primary_image) // Filtrujemy, by nie powtarzać zdjęcia priorytetowego
            .map((image, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 && !selectedGame.primary_image ? 'active' : ''}`}
              >
                <img
                  src={image}
                  className="d-block w-100"
                  alt={`Game image ${index + 1}`}
                  style={{ objectFit: 'contain', maxHeight: '300px' }}
                />
              </div>
            ))
        )}
      </div>

      {/* Przyciski do przewijania */}
      <button 
        className="carousel-control-prev" 
        type="button" 
        data-bs-target="#carouselExample" 
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button 
        className="carousel-control-next" 
        type="button" 
        data-bs-target="#carouselExample" 
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  ) : (
    <p>No images available for this game.</p>
  )}
  <p><strong>Theme:</strong> {selectedGame?.theme}</p>
  <p><strong>Players:</strong> {selectedGame?.players}</p>
  <p><strong>Difficulty:</strong> {selectedGame?.difficulty}</p>
  <p>{selectedGame?.description}</p>
</Modal.Body>


<Modal.Footer className="d-flex justify-content-center">
  <button
    className="btn btn-success"
    onClick={() => { handleRent(selectedGame?.gameid); handleCloseModal(); }}
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



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';
import '../modal.css'; // Używamy tego pliku CSS do stylowania modalu

const ManageGames = () => {

  // deklaracje zmiennych z rental , cześć na pewno będzie do usunięcia 
  const [games, setGames] = useState([]);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editedGame, setEditedGame] = useState(null);

  // Fetch available games from the server
  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/manage-games');
      if (response.ok) {
        const data = await response.json();
        setGames(data); 
      } else {
        setMessage('Error fetching games to manage.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch games to manage.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedGame((prev) => ({ ...prev, [name]: value }));
  };

  const updateGame = async (id, updatedGame) => {
    try {
      const response = await fetch(`http://localhost:5000/manage-games/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGame),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Game updated successfully:', data);
        setMessage('Game updated successfully.');
        fetchGames(); // Odśwież listę gier po edycji
      } else {
        setMessage('Error updating game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to update game.');
    }
  };

  const handleEditSubmit = async () => {
    if (!editedGame || !editedGame.gameid) {
      setMessage('Error: Game ID is missing.');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/manage-games/${editedGame.gameid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedGame),
      });
  
      if (response.ok) {
        setMessage('Game updated successfully.');
        fetchGames(); // Odświeżenie listy gier
      } else {
        setMessage('Error updating the game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating the game.');
    }
  
    setEditedGame(null); // Zamknięcie modala po zapisaniu
  };
    
  const handleEditClick = (game) => {
    setEditedGame(game); // Ustawienie gry do edycji
  };

  const handleRemoval = async (gameId) => {
    if (!window.confirm('Are you sure you want to remove this game from the offer?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/manage-games/${gameId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setMessage('Game removed successfully.');
        fetchGames(); // Odśwież listę gier po usunięciu
      } else {
        setMessage('Error removing the game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error removing the game.');
    }
  };
  useEffect(() => {
    fetchGames();
  }, []);

  const navigate = useNavigate(); // hook do nawigacji

  return (
  <div className="container py-4">
  <div className="d-flex justify-content-between align-items-center mb-4">
  <h2 className="text-center">Games to Manage:</h2>
    <button 
      className="btn btn-secondary w-25"
      onClick={() => navigate('/')}
    >
      Back to Main Page
    </button>
  </div>
  <div>
    {games.length > 0 ? (
      games.map((game) => (
        <div key={game.gameid} className="card mb-3" style={{ borderRadius: '10px' }}>
          <div className="card-body d-flex justify-content-between">
            <div>
              <h3 className="card-title">{game.title}</h3>
              <p><strong>Theme:</strong> {game.theme}</p>
              <p><strong>Players:</strong> {game.players}</p>
              <p><strong>Difficulty:</strong> {game.difficulty}</p>
              <p>{game.description}</p>
              {game.image_url && (
                <img
                  src={game.image_url}
                  className="img-fluid mb-3"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              )}
            </div>
            <div className="d-flex flex-column justify-content-start gap-2">
              <button 
                className="btn btn-success w-100 text-nowrap"
                onClick={() => setEditedGame(game)}
              >
                Edit Game Data
              </button>
              <button 
                className="btn btn-danger w-100 text-nowrap"
                onClick={() => handleRemoval(game.gameid)}
              >
                Remove Game
              </button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p>No available games at the moment.</p>
    )}
  </div>

  {message && <p className="mt-3 text-center text-danger">{message}</p>}

{/* Modal for editing game */}
{editedGame && (
  <div className="modal show d-block" style={{ 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1050'
  }}>
    <div className="modal-content" style={{
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: 'white',
      width: '500px', // Adjust width as needed
      maxWidth: '90%',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    }}>
      <span className="close" onClick={() => setEditedGame(null)}>&times;</span> {/* Close without saving */}
      <h3>Edit Game</h3>
      <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
        <div className="mb-3">
          <input
            type="text"
            name="title"
            value={editedGame.title}
            onChange={handleEditChange}
            className="form-control"
            placeholder="Title"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="theme"
            value={editedGame.theme}
            onChange={handleEditChange}
            className="form-control"
            placeholder="Theme"
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            name="players"
            value={editedGame.players}
            onChange={handleEditChange}
            className="form-control"
            placeholder="Number of players"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="difficulty"
            value={editedGame.difficulty}
            onChange={handleEditChange}
            className="form-control"
            placeholder="Difficulty"
          />
        </div>
        <div className="mb-3">
          <textarea
            name="description"
            value={editedGame.description}
            onChange={handleEditChange}
            className="form-control"
            placeholder="Description"
          />
        </div>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-success w-25">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

</div>

  );
};

export default ManageGames;

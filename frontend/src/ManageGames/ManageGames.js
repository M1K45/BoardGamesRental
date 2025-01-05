

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
    <div>
      <h2>Games to manage:</h2>
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
              <button onClick={() => setEditedGame(game)}>Edit game data</button>
              <button onClick={() => handleRemoval(game.gameid)}>Remove game from rental offer</button>
            </div>
          ))
        ) : (
          <p>No available games at the moment.</p>
        )}
      </div>

      {message && <p>{message}</p>}

      {/* Modal for editing game */}
      {editedGame && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setEditedGame(null)}>&times;</span> {/* Close without saving */}
            <h3>Edit Game</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
              <input
                type="text"
                name="title"
                value={editedGame.title}
                onChange={handleEditChange}
                placeholder="Title"
              />
              <input
                type="text"
                name="theme"
                value={editedGame.theme}
                onChange={handleEditChange}
                placeholder="Theme"
              />
              <input
                type="number"
                name="players"
                value={editedGame.players}
                onChange={handleEditChange}
                placeholder="Number of players"
              />
              <input
                type="text"
                name="difficulty"
                value={editedGame.difficulty}
                onChange={handleEditChange}
                placeholder="Difficulty"
              />
              <textarea
                name="description"
                value={editedGame.description}
                onChange={handleEditChange}
                placeholder="Description"
              />
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGames;

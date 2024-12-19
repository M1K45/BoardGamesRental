import React, { useState, useEffect } from 'react';

const RentGame = () => {
  const [games, setGames] = useState([]);
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  // Fetch available games from the server
  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/available-games');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        setMessage('Error fetching games.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to fetch games.');
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Handle rent game action
  const handleRent = async (gameId) => {
    // if (!userId) {
    //   setMessage('Please enter a valid User ID.');
    //   return;
    // }
    // console.log("hello");

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

  return (
    <div>
      <h2>Rent a Game</h2>
      {/* <div>
        <label htmlFor="user_id">User ID:</label>
        <input
          type="number"
          id="user_id"
          name="user_id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div> */}
      <div>
        {games.length > 0 ? (
          games.map((game) => (
            <div key={game.gameid} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{game.title}</h3>
              <p><strong>Theme:</strong> {game.theme}</p>
              <p><strong>Players:</strong> {game.players}</p>
              <p><strong>Difficulty:</strong> {game.difficulty}</p>
              <p>{game.description}</p>
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

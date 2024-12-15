import React, { useState } from 'react';

const RentGame = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    game_id: '',
  });

  const [message, setMessage] = useState('');

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
      const response = await fetch('http://localhost:5000/rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Rental successful! Rental ID: ${data.rental.rentalid}`);
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
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="user_id">User ID:</label>
          <input
            type="number"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="game_id">Game ID:</label>
          <input
            type="number"
            id="game_id"
            name="game_id"
            value={formData.game_id}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Rent</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RentGame;

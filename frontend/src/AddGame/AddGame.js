import React, { useState } from 'react';

const AddGame = () => {
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    players: '',
    difficulty: '',
    description: '',
    status: 'Available', // Domyślnie ustawione na "Available"
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
      const response = await fetch('http://localhost:5000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Game added successfully!');
        setFormData({
          title: '',
          theme: '',
          players: '',
          difficulty: '',
          description: '',
          status: 'Available',
        });
      } else {
        const errorText = await response.json();
        setMessage(`Error: ${errorText.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to add game.');
    }
  };

  return (
    <div>
      <h2>Add a New Game</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="theme">Theme:</label>
          <input
            type="text"
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="players">Players:</label>
          <input
            type="number"
            id="players"
            name="players"
            value={formData.players}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty:</label>
          <input
            type="text"
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit">Add Game</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddGame;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Correct import


const AddGame = () => {
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    players: '',
    difficulty: '',
    description: '',
    status: 'Available',
  });

  const [file, setFile] = useState(null); // For image upload
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please upload an image.');
      return;
    }

    const data = new FormData();
    data.append('image', file);
    data.append('title', formData.title);
    data.append('theme', formData.theme);
    data.append('players', formData.players);
    data.append('difficulty', formData.difficulty);
    data.append('description', formData.description);
    data.append('status', formData.status);

    try {
      const response = await axios.post('http://localhost:5000/games', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200 || response.status === 201) {
        setMessage('Game added successfully!');
        setFormData({
          title: '',
          theme: '',
          players: '',
          difficulty: '',
          description: '',
          status: 'Available',
        });
        setFile(null); // Clear the file input
      } else {
        setMessage('Error: Unable to add fiu fiu game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to add game.');
    }
  };

const navigate = useNavigate(); // hook do nawigacji


  return (
    <div>
      <button onClick={() => navigate('/')}>back to main page</button>
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
        <div>
          <label htmlFor="file">Upload Image:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>
        <button type="submit">Add Game</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddGame;

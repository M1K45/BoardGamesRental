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
      const response = await axios.post('http://localhost:5000/addgame', data, {
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
        setMessage('Error: Unable to add game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to add game.');
    }
  };

const navigate = useNavigate(); // hook do nawigacji

return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow p-4 position-relative" style={{ width: '400px', borderRadius: '10px' }}>
        <button 
          className="btn-close position-absolute top-0 end-0 m-3" 
          onClick={() => navigate('/')} 
          aria-label="Close"
        ></button>
        <h2 className="text-center mb-4" style={{ color: '#343a40' }}>Add a Game</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Title"
            />
            <label htmlFor="title">Title</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Theme"
            />
            <label htmlFor="theme">Theme</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="number"
              id="players"
              name="players"
              value={formData.players}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Number of Players"
            />
            <label htmlFor="players">Number of Players</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Difficulty"
            />
            <label htmlFor="difficulty">Difficulty</label>
          </div>
          <div className="form-floating mb-3">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Description"
              style={{ height: '100px' }}
            />
            <label htmlFor="description">Description</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="form-control"
              placeholder="Image URL"
            />
            <label htmlFor="image_url">Image URL</label>
          </div>
          <button type="submit" className="btn btn-success w-100 mb-3">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default AddGame;

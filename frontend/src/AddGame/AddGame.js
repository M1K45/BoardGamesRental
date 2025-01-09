import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddGame.css';

const AddGame = () => {
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    players: '',
    difficulty: '',
    description: '',
    status: 'Available',
  });

  const [priorityImage, setPriorityImage] = useState(null); // Priority image
  const [additionalImages, setAdditionalImages] = useState([]); // Additional images
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePriorityImageChange = (e) => {
    const file = e.target.files[0];
    setPriorityImage(file);
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages((prevImages) => {
      const updatedImages = [...prevImages, ...files];
      console.log('Selected files:', updatedImages); // Debug: Wyświetl wszystkie pliki
      return updatedImages;
    });
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleRemovePriorityImage = () => {
    setPriorityImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!priorityImage) {
      setMessage('Please upload a priority image.');
      return;
    }

    const data = new FormData();
    data.append('priorityImage', priorityImage);
    additionalImages.forEach((image, index) => {
      data.append('additionalImages', image);
    });

    // Append other form data
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

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
        setPriorityImage(null);
        setAdditionalImages([]);
      } else {
        setMessage('Error: Unable to add game.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to add game.');
    }
  };

  const navigate = useNavigate();

  const renderImagePreview = (image, index, isPriorityImage = false) => {
    return (
      <div className="position-relative">
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          className="img-thumbnail"
          style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
        />
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0"
          onClick={() => (isPriorityImage ? handleRemovePriorityImage() : handleRemoveAdditionalImage(index))}
          aria-label="Remove"
        />
        <div className="mt-1 text-center">{image.name}</div> {/* Display file name */}
      </div>
    );
  };

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
          <div className="mb-3">
            <label htmlFor="priorityImage" className="form-label">Priority Image</label>
            <input
              type="file"
              id="priorityImage"
              name="priorityImage"
              onChange={handlePriorityImageChange}
              className="form-control"
              required
            />
            {priorityImage && renderImagePreview(priorityImage, 0, true)}
          </div>
          <div className="mb-3">
            <label htmlFor="additionalImages" className="form-label">Additional Images</label>
            <input
              type="file"
              id="additionalImages"
              name="additionalImages"
              onChange={handleAdditionalImagesChange}
              className="form-control"
              multiple
              accept="image/*"
            />
            {additionalImages.length > 0 && (
              <div className="d-flex flex-wrap">
                {additionalImages.map((image, index) => (
                  <div key={index} className="m-2">
                    {renderImagePreview(image, index)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-success w-100 mb-3">Submit</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default AddGame;

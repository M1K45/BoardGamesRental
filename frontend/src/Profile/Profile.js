// src/Profile/Profile.js
import React, { useState, useEffect } from 'react';
import { getJwtToken } from '../utils/clearJwtToken'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import Footer from '../utils/footer';
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentedData, setRentedData] = useState([]);   // gry wypożyczone (Pending)
  const [reservedData, setReservedData] = useState([]); // gry zarezerwowane (Reserved)

  const navigate = useNavigate();

  // ----------------------------- FETCH USER PROFILE -----------------------------
  const fetchUserProfile = async () => {
    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/');
        return;
      }
      const decoded = jwtDecode(token);
      const { name, email } = decoded;

      setUserData({ name, email });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage('There was a problem fetching user data.');
      setLoading(false);
    }
  };

  // ----------------------------- FETCH RESERVED -----------------------------
  const fetchReserved = async (userId) => {
    try {
      const url = `http://localhost:5000/profile/reserved/${userId}`;
      console.log(`Fetching from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched Reserved Data:', data);

      if (Array.isArray(data) && data.length > 0) {
        setReservedData(data);
      } else {
        console.log('No reserved games found');
      }
    } catch (error) {
      console.error('Error fetching reserved rentals:', error);
      setMessage('Error: Unable to fetch reserved rentals.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- FETCH RENTED (PENDED) -----------------------------
  const fetchPended = async (userId) => {
    try {
      const url = `http://localhost:5000/profile/pended/${userId}`;
      console.log(`Fetching from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched Pending Data:', data);

      if (Array.isArray(data) && data.length > 0) {
        setRentedData(data); 
      } else {
        console.log('No rented (pending) games found');
      }
    } catch (error) {
      console.error('Error fetching pending rentals:', error);
      setMessage('Error: Unable to fetch pending rentals.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- CANCEL -----------------------------
  const handleCancel = async (gameId, type) => {
    if (!gameId) {
      console.error('Error: gameId is undefined in handleCancel.');
      setMessage('Error: Unable to cancel. Game ID is missing.');
      return;
    }

    try {
      const token = getJwtToken();
      if (!token) {
        navigate('/');
        return;
      }

      const userId = jwtDecode(token).id;
      const url = `http://localhost:5000/profile/${type}/cancel/${gameId}`;
      console.log(`Calling CANCEL endpoint: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (type === 'reserved') {
        await fetchReserved(userId);
      } else {
        await fetchPended(userId);
      }

      setMessage(`Game with id: ${gameId} canceled successfully.`);
    } catch (error) {
      console.error('Error canceling game:', error);
      setMessage('Error: Unable to cancel the game.');
    }
  };

  // ----------------------------- USE EFFECT -----------------------------
  useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      navigate('/');
      return;
    }
    const decoded = jwtDecode(token); 
    const userId = decoded.id;

    fetchUserProfile();
    fetchReserved(userId);
    fetchPended(userId);
  }, []);

  // ----------------------------- RENDER -----------------------------
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">User Profile</h2>
        <button 
          className="btn btn-secondary w-auto"
          onClick={() => navigate('/')}>
            Back to Main Page
        </button>
      </div>

      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}

      {userData ? (
        <>
          <div className="mb-4">
            <h3>{userData.name}</h3>
            <p>Email: {userData.email}</p>
          </div>

          <div className="mb-4">
            <h3>Reserved Games:</h3>
            <div className="row">
              {reservedData.length > 0 ? (
                reservedData.map((game, index) => {
                  console.log('Game in render:', game);
                  return (
                    <div key={game.gameid || index} className="col-md-4 mb-4">
                      <div className="card h-100">
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
                          <p>Reservation valid until: {new Date(game.enddate).toLocaleDateString()}</p>
                        
                          <button
                            className="button"
                            onClick={() => handleCancel(game.gameid, 'reserved')}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No games reserved yet.</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3>Rented (Pending) Games:</h3>
            <div className="row">
              {rentedData.length > 0 ? (
                rentedData.map((game) => (
                  <div key={game.gameid} className="col-md-4 mb-4">
                    <div className="card h-100">
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
                        <p>Return date: {new Date(game.enddate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No games rented yet.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
      <Footer />
    </div>
  );
};

export default Profile;
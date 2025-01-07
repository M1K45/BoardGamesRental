import React, { useState, useEffect } from 'react';
import { getJwtToken } from '../utils/clearJwtToken'; // Funkcja do pobrania tokenu
import { useNavigate } from 'react-router-dom'; // Correct import
import { jwtDecode } from 'jwt-decode';
import Footer from '../utils/footer';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentedData, setRentedData] = useState([]);
  const [reservedData, setReservedData] = useState([]);

  const navigate = useNavigate(); // hook do nawigacji

  // Funkcja do pobrania danych użytkownika
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
      setLoading(false); // Zakończ ładowanie po pobraniu danych
    } catch (error) {
      console.error('Błąd podczas pobierania danych użytkownika:', error);
      setMessage('Wystąpił problem podczas pobierania danych użytkownika.');
      setLoading(false);
    }
  };

  const fetchReserved = async (userId) => {
    try {
      console.log(`Fetching from: http://localhost:5000/profile/reserved/${userId}`);

      const response = await fetch(`http://localhost:5000/profile/reserved/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);

      if (data.length > 0) {
        setReservedData(data); // Ustawiamy dane o wypożyczeniach
      }
    } catch (error) {
      console.error('Error fetching reserved rentals:', error);
      setMessage('Error: Unable to fetch reserved rentals .');
    } finally {
      setLoading(false); // Wyłączamy stan ładowania
    }
  };

  const fetchPended = async (userId) => {
    try {
      console.log(`Fetching from: http://localhost:5000/profile/pended/${userId}`);

      const response = await fetch(`http://localhost:5000/profile/pended/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);

      if (data.length > 0) {
        setRentedData(data); // Ustawiamy dane o wypożyczeniach
      } else {
      }
    } catch (error) {
      console.error('Error fetching reserved rentals:', error);
      setMessage('Error: Unable to fetch reserved rentals .');
    } finally {
      setLoading(false); // Wyłączamy stan ładowania
    }
  };

;

  // Wykonujemy fetch po załadowaniu komponentu
  useEffect(() => {
    const token = getJwtToken();
    if(!token){
      navigate('/');
      return;
    }
    const decoded = jwtDecode(token); // Dekodowanie tokenu JWT, aby pobrać userId
    const userId = decoded.id;
    fetchUserProfile();
    fetchReserved(userId);
    fetchPended(userId);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Pokazujemy loader, jeśli dane jeszcze się ładują
  }

  if (message) {
    return <div>{message}</div>;
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
  {/* <h1>User Profile</h1> */}
  {userData ? (
    <div>
      <div className="mb-4">
        <h3>{userData.name}</h3>
        <p>Email: {userData.email}</p>
      </div>

      <div className="mb-4">
        <h3>Reserved Games:</h3>
        <div className="row">
          {reservedData.length > 0 ? (
            reservedData.map((game) => (
              <div key={game.gameid} className="col-md-4 mb-4">
                <div className="card h-100" style={{ cursor: 'pointer' }}>
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
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No games reserved yet.</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3>Rented Games:</h3>
        <div className="row">
          {rentedData.length > 0 ? (
            rentedData.map((game) => (
              <div key={game.gameid} className="col-md-4 mb-4">
                <div className="card h-100" style={{ cursor: 'pointer' }}>
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
    </div>
  ) : (
    <p>Loading user data...</p>
  )}
      <Footer />
</div>
  );
};

export default Profile;

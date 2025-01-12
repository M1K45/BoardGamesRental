import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import
import { clearJwtToken, getJwtToken } from '../utils/clearJwtToken';
import { jwtDecode } from 'jwt-decode';

const Admin = ({ setIsAdmin }) => {
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Fetch all rentals
  const fetchRentals = async () => {
    try {
      const response = await fetch('http://localhost:5000/rentals');
      const data = await response.json();
      const sortedData = data.sort((a, b) => b.rentalid - a.rentalid);
      
      setRentals(sortedData);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  // Handle Pending Status
  const handlePending = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage('Rental updated to Pending.');
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error updating rental to Pending.');
      }
    } catch (error) {
      console.error('Error updating rental:', error);
    }
  };

  // Handle End Status
  const handleEnd = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/end`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage('Rental ended and game set to Available.');
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error ending rental.');
      }
    } catch (error) {
      console.error('Error ending rental:', error);
    }
  };
  
  // NOWE FUNKCJE:
  // Handle Extend
  const handleExtend = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage(`Rental ${rentalId} has been extended successfully.`);
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error extending rental.');
      }
    } catch (error) {
      console.error('Error extending rental:', error);
      setMessage('Error extending rental.');
    }
  };

  // Handle Cancel
  const handleCancel = async (rentalId) => {
    try {
      const response = await fetch(`http://localhost:5000/rentals/${rentalId}/cancel`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMessage(`Rental ${rentalId} has been canceled successfully.`);
        fetchRentals(); // Refresh rentals
      } else {
        setMessage('Error canceling rental.');
      }
    } catch (error) {
      console.error('Error canceling rental:', error);
      setMessage('Error canceling rental.');
    }
  };

  const handleLogout = () => {
    clearJwtToken();  
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/'); 
  };

  useEffect(() => {
    fetchRentals();
    const token = getJwtToken();
    if (token) {
      setIsAuthenticated(true);
      const decoded = jwtDecode(token);
      setUsername(decoded.name);
      navigate('/');
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <div className="d-flex justify-content-between w-100">
            <button className="btn btn-success w-100 me-2" onClick={() => navigate('/rent')}>
              Rent a Game
            </button>
            <button className="btn btn-success w-100 me-2" onClick={() => navigate('/addgame')}>
              Add Game
            </button>
            <button className="btn btn-success w-100 me-2" onClick={() => navigate('/manage-games')}>
              Manage Games
            </button>
            <button className="btn btn-success w-100 me-2" onClick={() => navigate('/users')}>
              Users
            </button>
            <button className="btn btn-success w-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <h2 className="text-center mb-4">Admin: Rentals Management</h2>
      {message && <p className="text-center text-danger">{message}</p>}
      <div className="table-responsive">
        <table className="table table-striped table-hover shadow">
          <thead className="table-dark">
            <tr>
              <th>Rental ID</th>
              <th>User ID</th>
              <th>Game ID</th>
              <th>Game Title</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.rentalid}>
                <td>{rental.rentalid}</td>
                <td>{rental.userid}</td>
                <td>{rental.gameid}</td>
                <td>{rental.title}</td>
                <td>{new Date(rental.enddate).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      rental.returnstatus === 'reserved'
                        ? 'bg-success'
                        : rental.returnstatus === 'pending'
                        ? 'bg-warning'
                        : 'bg-secondary'
                    }`}
                  >
                    {rental.returnstatus}
                  </span>
                </td>
                <td>
                  
                    <div className="d-flex gap-2">
                      {rental.returnstatus === 'Reserved' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handlePending(rental.rentalid)}
                        >
                          Set Pending
                        </button>
                      )}
                      
                      {rental.returnstatus === 'Pending' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEnd(rental.rentalid)}
                        >
                          Set End
                        </button>
                      )}
                      {rental.returnstatus !== 'End' && (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleExtend(rental.rentalid)}
                      >
                        Extend
                      </button>
                      )}
                      {rental.returnstatus !== 'End' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleCancel(rental.rentalid)}
                      >
                        Cancel
                      </button>
                      )}
                    </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;

import React, { useEffect, useState } from 'react';

const Admin = () => {
  const [rentals, setRentals] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch all rentals
  const fetchRentals = async () => {
    try {
      const response = await fetch('http://localhost:5000/rentals');
      const data = await response.json();
      setRentals(data);
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

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <div>
      <h2>Admin: Rentals Management</h2>
      {message && <p>{message}</p>}
      <table>
        <thead>
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
              <td>{rental.returnstatus}</td>
              <td>
                <button onClick={() => handlePending(rental.rentalid)}>Set Pending</button>
                <button onClick={() => handleEnd(rental.rentalid)}>Set End</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;

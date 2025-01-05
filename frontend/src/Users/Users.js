import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import


const Users = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch users from the server
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setMessage('Error fetching users.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigate = useNavigate(); // hook do nawigacji


  return (
    <div>
      <h2>Users Management</h2>
      <button onClick={() => navigate('/')}>back to main page</button>

      {message && <p>{message}</p>}
      {users.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.status ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default Users;

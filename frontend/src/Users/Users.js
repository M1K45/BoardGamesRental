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
        console.log(data)
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
    
    <div className="container mt-4"> 

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Users Management</h2>
        <button 
          className="btn btn-secondary w-25"
          onClick={() => navigate('/')}>
            Back to Main Page
          </button>
      </div>


      {/* Message */}
      {message && <p className="text-center text-danger">{message}</p>}

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm rounded">
            <thead className="table-dark">
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.status ? 'bg-success' : 'bg-secondary'}`}>
                      {user.status ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-muted">No users found.</p>
      )}
    </div> 
  );
};

export default Users;

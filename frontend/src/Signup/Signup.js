import React, { useState } from 'react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Account created successfully!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Unable to create account.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8f9fa' }}>
    <div className="card shadow p-4" style={{ width: '400px', borderRadius: '10px' }}>
      <h2 className="text-center mb-4" style={{ color: '#343a40' }}>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Name"
          />
          <label htmlFor="name">Username</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Email"
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Password"
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
      {message && <p className="mt-3 text-center text-danger">{message}</p>}
      <div className="text-center mt-3">
        <a href="/login" className="text-muted">Already have an account? Login</a>
      </div>
    </div>
  </div>
  );
};

export default Signup;

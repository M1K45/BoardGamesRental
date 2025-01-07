
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Signup/Signup';
import Login from './Login/Login';
import Rent from './Rent/Rent';
import Admin from './Admin/Admin';
import AddGame from './AddGame/AddGame';
import Users from './Users/Users';
import Profile from './Profile/Profile';
import ManageGames from './ManageGames/ManageGames';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getJwtToken } from './utils/clearJwtToken'; // Assuming getJwtToken is properly implemented
import { jwtDecode } from 'jwt-decode';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getJwtToken();
    if (token) {
      try {
        console.log('co do..');
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.status === 1); // Zakładamy, że status 1 oznacza administratora
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
        <Route path="/rent" element={<Rent isAdmin={isAdmin} />} />
        <Route path="/admin" element={isAdmin ? <Admin setIsAdmin={setIsAdmin} /> : <Rent />} />
        <Route path="/addgame" element={<AddGame />} />
        <Route path="/manage-games" element={<ManageGames/>} />
        <Route path="/users" element={<Users/>} />
        <Route path="/profile" element={<Profile/>} />        
        {/* Dynamiczna strona główna w zależności od isAdmin */}
        <Route path="/" element={isAdmin ? <Admin  setIsAdmin={setIsAdmin}/> : <Rent isAdmin={isAdmin}/>} />
        
        {/* fallback w razie złej ścieżki */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

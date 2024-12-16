import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup/Signup';
import Login from './Login/Login';
import Rent from './Rent/Rent';
import Admin from './Admin/Admin';
import AddGame from './AddGame/AddGame';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
      <Routes>
        <Route path="/rent" element={<Rent />} />
      </Routes>
      <Routes>
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Routes>
        <Route path="/addgame" element={<AddGame/>} />
      </Routes>
    </Router>
  );
};

export default App;

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Signup from './Signup/Signup';
// import Login from './Login/Login';
// import Rent from './Rent/Rent';
// import Admin from './Admin/Admin';
// import AddGame from './AddGame/AddGame';
// import NavigatePage from './NavigatePage/NavigatePage';
// import { clearJwtToken, getJwtToken } from './utils/clearJwtToken';
// import { jwtDecode } from 'jwt-decode';



// const App = () => {
//   const [isAdmin, setIsAdmin] = useState(false);
  
//   const token = getJwtToken();
//   // console.log('tu jestem', jwtDecode(token).status);
//   useEffect(() => {
//   if (token && jwtDecode(token).status === 1) {
//     setIsAdmin(true); 
//     // console.log('zalogowano jako administrator');
//      // Jeśli token istnieje i status jest równy 1,
//     // to ustawiamy, że użytkownik jest administratorem
//     // console.log('token: ', token);
//     // const decoded = jwtDecode(token);
//   }
// }, []);
//   return (
//     <Router>
//       <Routes>
//         <Route path="/signup" element={<Signup />} />
//       </Routes>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//       </Routes>
//       <Routes>
//         <Route path="/rent" element={<Rent />} />
//       </Routes>
//       <Routes>
//         <Route path="/admin" element={<Admin />} />
//       </Routes>
//       <Routes>
//         <Route path="/addgame" element={<AddGame/>} />
//       </Routes>
//       <Routes>
//         {!isAdmin ? (
//         <Route path="/" element={<AddGame/>}/> ):(

//         <Route path="/" element={<Rent/>} /> )}
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Signup/Signup';
import Login from './Login/Login';
import Rent from './Rent/Rent';
import Admin from './Admin/Admin';
import AddGame from './AddGame/AddGame';
import ManageGames from './ManageGames/ManageGames';

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

        
        {/* Dynamiczna strona główna w zależności od isAdmin */}
        <Route path="/" element={isAdmin ? <Admin  setIsAdmin={setIsAdmin}/> : <Rent isAdmin={isAdmin}/>} />
        
        {/* Dodaj fallback w razie złej ścieżki */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cookieParser = require("cookie-parser");

// deklaracja route do endpointów
const signupRoute = require('./routes/signup');
const rentRoute = require('./routes/rent');
const loginRoute = require('./routes/login');
const rentalsRoute = require('./routes/rentals');
const addGameRoute = require('./routes/addGame');
const manageGamesRoute = require('./routes/manageGames');
const avaliableGamesRoute = require('./routes/availableGames');
const usersRoute = require('./routes/users');
const profileRoute = require('./routes/profile');

// Tworzenie aplikacji Express
const app = express();
app.use(bodyParser.json());

require('dotenv').config();

const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'PUT', 'DELETE'],          // Dozwolone metody
  allowedHeaders: ['Content-Type', 'Authorization', 'x-amz-date', 'x-amz-security-token', 'x-amz-request-payer'],  // Dozwolone nagłówki
  exposedHeaders: ['x-amz-request-id', 'x-amz-id-2'],  // Nagłówki, które mogą być dostępne po stronie klienta
  maxAge: 3000      
}));

app.use(express.json());
app.use(cookieParser());

app.use('/signup', signupRoute);
app.use('/login', loginRoute);

//endpoint do zamówienia gry
app.use('/rent', rentRoute);

// endpoint do zwracania zamówionych i wypożyczonych gier
app.use('/rentals', rentalsRoute);

app.use('/addgame', addGameRoute);

// endpoint do edytowania informacji o grze (na razie bez wymiany zdjęć)
app.use('/manage-games', manageGamesRoute);

// zwracanie dostępnych do zamówienia gier
app.use('/available-games', avaliableGamesRoute);

// zwracanie wszystkich użytkowników z bazy
app.use('/users', usersRoute);

app.use('/profile', profileRoute);

// Uruchamianie serwera na porcie 5000
const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

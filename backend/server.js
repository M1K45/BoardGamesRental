const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
// const { cookieJwtAuth } = require("./middleware/cookieJwtAuth");

// Tworzenie aplikacji Express
const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;


const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.use(cookieParser());
// Konfiguracja bazy danych PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});



const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token; // Assuming the cookie is named 'token'
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret
        console.log("Przechodzenie przez autoryzacje ")

        // req.user = decoded; // Attach user data to the request object
        next(); // Pass control to the next middleware
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};


app.post('/login', async (req, res) => {

  try {

    // res.header("Access-Control-Allow-Headers","");
    const { email, password } = req.body;

    console.log('Logging in user:', { email });

  
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

  
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      {id: user.id, email: user.email},
      JWT_SECRET,
      {expiresIn: '1h'}
    );

    res.cookie("token", token, {
      httpOnly: false,
    });
    // res.status(200).send({user, token: jwt.token});
    console.log('User logged in:', user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      name: user.name,
    });
    
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in.',
    });
  }
});


app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registering user:', { name, email });

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered.',
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    console.log('User inserted:', result.rows[0]);

    res
      .status(201)
      .json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res
      .status(500)
      .json({
        success: false,
        message: 'Server error while registering new user.',
      });
  }
});

app.post('/rent', cookieJwtAuth, async (req, res) => {
  try {
    const token = req.cookies.token
    const decoded = jwt.decode(token); // Decodes without verifying the signature
    // console.log(typeof decoded.id);
    // console.log(token);
    // if (token) {
    //   jwt.verify(token, JWT_SECRET, (err, decoded) => {
    //     if (err) {
    //       console.error('Token verification failed:', err);
    //       return res.status(401).send('Invalid token');
    //     }
    
    //     // // decoded contains the payload (id, email, etc.)
    //     // const { id, email } = decoded;
    //     // console.log('User ID:', id);
    //     // console.log('User Email:', email);
    
    //     // // You can now use id and email as needed
    //   });
    // } else {
    //   return res.status(400).send('Token not provided');
    // }
    
    const { game_id } = req.body;
    const user_id = Number(decoded.id);

    // Sprawdzenie, czy user_id istnieje
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Sprawdzenie, czy game_id istnieje oraz czy gra ma status Avaiable
    const gameResult = await pool.query('SELECT * FROM games WHERE gameid = $1', [game_id]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    const game = gameResult.rows[0];
    if (game.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Game is not available for rent.' });
    }
    console.log('Creating rental:', { user_id, game_id });
    // Ustawienie enddate na +7 dni od teraz
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 4);

    // Zmienienie status gry na Rented
    const gameStatus = await pool.query(
      'UPDATE games SET status = $1 WHERE gameid = $2',
      ['Rented', game_id]
    );

    // Dodanie wpisu do tabeli rentals
    const result = await pool.query(
      'INSERT INTO rentals (userid, gameid, enddate, returnstatus) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, game_id, endDate, 'Reserved']
    );

    console.log('Rental created:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Rental created successfully.',
      rental: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating rental:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rental.',
    });
  }
});

app.get('/rentals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rentals.rentalid, rentals.userid, rentals.gameid, rentals.enddate, rentals.returnstatus, games.title
      FROM rentals
      JOIN games ON rentals.gameid = games.gameid
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching rentals:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching rentals.' });
  }
});

app.put('/rentals/:id/pending', async (req, res) => {
  try {
    const { id } = req.params;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 7);

    await pool.query(
      'UPDATE rentals SET returnstatus = $1, enddate = $2 WHERE rentalid = $3',
      ['Pending', newEndDate, id]
    );

    res.status(200).json({ success: true, message: 'Rental updated to Pending.' });
  } catch (error) {
    console.error('Error updating rental status:', error.message);
    res.status(500).json({ success: false, message: 'Error updating rental status.' });
  }
});

app.put('/rentals/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    // Pobierz game_id dla danego rental
    const rental = await pool.query('SELECT gameid FROM rentals WHERE rentalid = $1', [id]);
    if (rental.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    const gameId = rental.rows[0].gameid;

    // Zaktualizuj status wypożyczenia i gry
    await pool.query('UPDATE rentals SET returnstatus = $1 WHERE rentalid = $2', ['End', id]);
    await pool.query('UPDATE games SET status = $1 WHERE gameid = $2', ['Available', gameId]);

    res.status(200).json({ success: true, message: 'Rental ended and game set to Available.' });
  } catch (error) {
    console.error('Error ending rental:', error.message);
    res.status(500).json({ success: false, message: 'Error ending rental.' });
  }
});

// pobranie dostępnych gier do wynajęcia 
app.get('/available-games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games WHERE status = $1', ['Available']);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching available games:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching available games.' });
  }
});

app.post('/games', async (req, res) => {
  try {
    const { title, theme, players, difficulty, description, status } = req.body;

    if (!title || !theme || !players || !difficulty || !description || !status) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const result = await pool.query(
      'INSERT INTO games (title, theme, players, difficulty, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, theme, players, difficulty, description, status]
    );

    res.status(201).json({ success: true, message: 'Game added successfully.', game: result.rows[0] });
  } catch (error) {
    console.error('Error adding game:', error.message);
    res.status(500).json({ success: false, message: 'Server error while adding game.' });
  }
});



// Uruchamianie serwera na porcie 5000
const port = 5000;
app.listen(port, () => {
  // res.clearCookie("token");
  // console.log("cookie deleted");
  console.log(`Server running at http://localhost:${port}/`);
});

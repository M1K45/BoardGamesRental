const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');


// Tworzenie aplikacji Express
const app = express();
app.use(bodyParser.json());



const cors = require('cors');
app.use(cors());

// Konfiguracja bazy danych PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.post('/login', async (req, res) => {
  try {
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

    console.log('User logged in:', user);
    res.status(200).json({
      success: true,
      message: 'Login successful',
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
// Uruchamianie serwera na porcie 5000
const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

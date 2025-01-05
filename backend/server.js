const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
// Tworzenie aplikacji Express
const app = express();
app.use(bodyParser.json());

require('dotenv').config();


const JWT_SECRET = process.env.JWT_SECRET;
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


// na potrzeby tokena jwt i wrzucania zdjęć do amazona s3
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'PUT'],          // Dozwolone metody
  allowedHeaders: ['Content-Type', 'Authorization', 'x-amz-date', 'x-amz-security-token', 'x-amz-request-payer'],  // Dozwolone nagłówki
  exposedHeaders: ['x-amz-request-id', 'x-amz-id-2'],  // Nagłówki, które mogą być dostępne po stronie klienta
  maxAge: 3000      
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

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Konfiguracja Multer do przechwytywania plików
const upload = multer({
  dest: 'uploads/', // Tymczasowy katalog lokalny
});

const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token; // Assuming the cookie is named 'token'
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        console.log("Przechodzenie przez autoryzacje ")
        next(); // Pass control to the next middleware
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};


app.post('/login', async (req, res) => {

  try {
    bcrypt.hash('password123', 10, (err, hash) => console.log('Hashed password for John:', hash));
    bcrypt.hash('admin', 10, (err, hash) => console.log('Hashed password for Admin:', hash));


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
      {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      },
      JWT_SECRET,
      {expiresIn: '1h'}
    );

    res.cookie("token", token, {
      httpOnly: false,
    });
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

//pobranie wszystkich gier w celu zarządzania nimi
app.get('/manage-games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.status(200).json(result.rows);
    console.log(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching games to manage.' });
  }
});



// pobranie dostępnych gier do wynajęcia 
app.get('/available-games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games WHERE status = $1', ['Available']);
    res.status(200).json(result.rows);
    console.log(result.rows);
  } catch (error) {
    console.error('Error fetching available games:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching available games.' });
  }
});

//edycja informacji o grze 
app.put('/manage-games/:id', async (req, res) => {
  const { id } = req.params; // ID gry, którą edytujemy
  const { title, theme, players, difficulty, description, status } = req.body; // Dane do aktualizacji

  try {
    const result = await pool.query(
      'UPDATE games SET title = $1, theme = $2, players = $3, difficulty = $4, description = $5, status = $6 WHERE gameid = $7 RETURNING *',
      [title, theme, players, difficulty, description, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Game updated successfully.',
      game: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating game:', error.message);
    res.status(500).json({ success: false, message: 'Error updating game.' });
  }
});

// generowanie unikalnej nazwy - nazwy plików w s3 nie mogą się powtarzać
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// dodawanie gier do wypożyczalni
app.post('/games', upload.single('image'), async (req, res) => {
  try {
    // Przypisanie danych z formularza
    const { title, theme, players, difficulty, description, status } = req.body;
    
    // Pobierz ścieżkę do przesłanego pliku
    const filePath = path.join(__dirname, req.file.path);

    // Unikalna nazwa pliku w S3
    const s3Key = `photos/${Date.now()}-${req.file.originalname}`;

    // Wczytaj plik jako stream
    const fileStream = fs.createReadStream(filePath);

    // Parametry do przesłania pliku do S3
    const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Body: fileStream,
    ContentType: req.file.mimetype,
    };

    // Wyślij plik do S3
    const command = new PutObjectCommand(uploadParams);
    const s3Response = await s3.send(command);

    // URL do obrazu w S3
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;

    // Usuń lokalny plik po przesłaniu
    fs.unlinkSync(filePath);

    // Dodaj grę do bazy danych
    const result = await pool.query(
      'INSERT INTO games (title, theme, players, difficulty, description, status, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, theme, players, difficulty, description, status, imageUrl]
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
  console.log(`Server running at http://localhost:${port}/`);
});

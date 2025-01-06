const express = require('express');
const router = express.Router();
const pool = require('../db');
const cookieJwtAuth = require('../utils/cookieJwtAuth');
const jwt = require('jsonwebtoken');

router.post('/', cookieJwtAuth, async (req, res) => {
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

module.exports = router;

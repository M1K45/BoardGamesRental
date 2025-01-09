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
        ['Reserved', game_id]
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

  // Przykładowy endpoint: POST /api/reservations/cancel
router.post('/cancel', cookieJwtAuth, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.decode(token);

    const { game_id } = req.body;
    const user_id = Number(decoded.id);

    // 1. Sprawdź, czy użytkownik istnieje
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 2. Sprawdź, czy gra istnieje
    const gameResult = await pool.query('SELECT * FROM games WHERE gameid = $1', [game_id]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    const game = gameResult.rows[0];

    // 3. Sprawdź, czy gra ma status "Reserved"
    if (game.status !== 'Reserved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Game is not currently reserved.' 
      });
    }

    // 4. Zmień status gry na "Available"
    await pool.query(
      'UPDATE games SET status = $1 WHERE gameid = $2',
      ['Available', game_id]
    );

    // 5. Usuń wpis w tabeli rentals (lub zaktualizuj 'returnstatus', zależnie od logiki)
    // Tu zakładamy, że chcemy całkowicie usunąć rezerwację:
    const deleteResult = await pool.query(
      'DELETE FROM rentals WHERE gameid = $1 AND userid = $2 AND returnstatus = $3',
      [game_id, user_id, 'Reserved']
    );

    // Możesz sprawdzić, czy cokolwiek zostało usunięte:
    if (deleteResult.rowCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No matching reservation found for this user/game.' 
      });
    }

    // 6. Zwróć odpowiedź
    res.status(200).json({
      success: true,
      message: 'Reservation canceled successfully.',
    });
  } catch (err) {
    console.error('Error canceling reservation:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while canceling the reservation.',
    });
  }
});
module.exports = router;
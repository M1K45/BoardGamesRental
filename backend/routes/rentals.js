const express = require('express');
const router = express.Router();
const pool = require('../db');

//Tutaj jest kod backendu do podstrony Adminirstatora

// pobieranie informacji o wypożyczeniach do tabeli
router.get('/', async (req, res) => {
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

// Ustawianie statusu wypożyczenia na "wypożyczono" i "oddano"  
  router.put('/:id/pending', async (req, res) => {
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
  
  router.put('/:id/end', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Pobierz game_id dla danego rental
      const rental = await pool.query('SELECT gameid FROM rentals WHERE rentalid = $1', [id]);
      if (rental.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rental not found.' });
      }
  
      const gameId = rental.rows[0].gameid;
  
      // Update game and rental status
      await pool.query('UPDATE rentals SET returnstatus = $1 WHERE rentalid = $2', ['End', id]);
      await pool.query('UPDATE games SET status = $1 WHERE gameid = $2', ['Available', gameId]);
  
      res.status(200).json({ success: true, message: 'Rental ended and game set to Available.' });
    } catch (error) {
      console.error('Error ending rental:', error.message);
      res.status(500).json({ success: false, message: 'Error ending rental.' });
    }
  });


// Extending game reservation
router.put('/:id/extend', async (req, res) => {
  try {
    const { id } = req.params;

    //Query changing date one day ahead
    await pool.query("UPDATE rentals SET enddate = enddate + INTERVAL '1 day' WHERE rentalid = $1", [id]);

    res.status(200).json({ success: true, message: 'Reservation is extended.' });
  } catch (error) {
    console.error('Error extending reservation:', error.message);
    res.status(500).json({ success: false, message: 'Error extending reservaation.' });    
  }
});

// Cancelling reservation
router.delete('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieval game id from reservation instance 
    const rental = await pool.query('SELECT gameid FROM rentals WHERE rentalid = $1', [id]);
    if (rental.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }
    const gameId = rental.rows[0].gameid;

    //removal the instance 
    await pool.query('DELETE FROM rentals WHERE rentalid = $1', [id]);

    //Change game status
    await pool.query('UPDATE games SET status = $1 WHERE gameid = $2', ['Available', gameId]);

    res.status(200).json({ success: true, message: 'Reservation is cancelled.' });
  } catch (error) {
    console.error('Error cancelling reservation:', error.message);
    res.status(500).json({ success: false, message: 'Error cancelling reservation.' });
  }
});
  module.exports = router;
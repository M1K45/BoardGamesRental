const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM games');
      res.status(200).json(result.rows);
      console.log(result.rows);
    } catch (error) {
      console.error('Error fetching games:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching games to manage.' });
    }
  });


//edycja informacji o grze 
router.put('/:id', async (req, res) => {
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
  
  router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Pobierz ID gry z parametrów URL
  
    try {
      const result = await pool.query('DELETE FROM games WHERE gameid = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Game not found.' });
      }
  
      res.status(200).json({ success: true, message: 'Game removed successfully.', game: result.rows[0] });
    } catch (error) {
      console.error('Error removing game:', error.message);
      res.status(500).json({ success: false, message: 'Error removing game.' });
    }
  });
  
module.exports = router;

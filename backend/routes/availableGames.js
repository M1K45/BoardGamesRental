const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM games WHERE status = $1', ['Available']);
      res.status(200).json(result.rows);
      console.log(result.rows);
    } catch (error) {
      console.error('Error fetching available games:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching available games.' });
    }
  });
  
module.exports = router;
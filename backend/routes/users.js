const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching users.' });
    }
  });

module.exports = router;
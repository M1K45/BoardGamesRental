const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

router.post('/', async (req, res) => {
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

module.exports = router;
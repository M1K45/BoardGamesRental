const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/', async (req, res) => {

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

module.exports = router;

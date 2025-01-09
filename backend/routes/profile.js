const express = require('express');
const router = express.Router();
const pool = require('../db');
const cookieJwtAuth = require('../utils/cookieJwtAuth');
const jwt = require('jsonwebtoken');



router.get('/reserved/:id', async (req, res) => {
  const id = Number(req.params.id); // id użytkownika 

  console.log('id: ', id);
  try {
    const result = await pool.query(`
      SELECT 
          g.title, 
          i.image_url,  -- Pobieramy zdjęcie z tabeli images
          r.enddate
      FROM 
          rentals r
      JOIN 
          games g ON r.gameid = g.gameid
      LEFT JOIN 
          images i ON g.gameid = i.gameid AND i.priority = TRUE  -- Dołączamy zdjęcie o priorytecie TRUE
      WHERE 
          r.userid = $1
          AND r.returnstatus = $2;
    `, [id, 'Reserved']);
    
        // console.log('wyniki zapytania: ',result);

        if (result.rowCount === 0) {
            return res.status(200).json({ success: true, message: 'Nie zarezerwowano żadnej gry.' });
        }
        res.status(200).json(result.rows);

      } catch (error) {
        console.error('Error fetching rentals:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching rentals.' });
      }
  });
  
  router.get('/pended/:id', async (req, res) => {
    const id = Number(req.params.id); // id użytkownika 
  
    console.log('id: ', id);
    try {
      const result = await pool.query(`
        SELECT 
            g.title, 
            i.image_url,  -- Pobieramy zdjęcie z tabeli images
            r.enddate
        FROM 
            rentals r
        JOIN 
            games g ON r.gameid = g.gameid
        LEFT JOIN 
            images i ON g.gameid = i.gameid AND i.priority = TRUE  -- Dołączamy zdjęcie o priorytecie TRUE
        WHERE 
            r.userid = $1
            AND r.returnstatus = $2;
      `, [id, 'Pending']);
  
          // console.log('wyniki zapytania: ',result);
  
          if (result.rowCount === 0) {
            return res.status(200).json({ success: true, message: 'Nie zarezerwowano żadnej gry.' });

            
          }
          res.status(200).json(result.rows);
  
        } catch (error) {
          console.error('Error fetching rentals:', error.message);
          res.status(500).json({ success: false, message: 'Error fetching rentals.' });
        }
    });

  module.exports = router;
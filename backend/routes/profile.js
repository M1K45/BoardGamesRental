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
          g.gameid,     -- Pobieramy tu id aby móc anulowaać rezerwacje
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
  
          if (result.rowCount === 0) {
            return res.status(200).json({ success: true, message: 'Nie zarezerwowano żadnej gry.' });

            
          }
          res.status(200).json(result.rows);
  
        } catch (error) {
          console.error('Error fetching rentals:', error.message);
          res.status(500).json({ success: false, message: 'Error fetching rentals.' });
        }
    });

    router.patch('/cancel/:gameid', async (req, res) => {
      const id = Number(req.params.gameid);
      try {
      // change game status to Available
      await pool.query('UPDATE games SET status = $1 WHERE gameid = $2', ['Available', id]);

      //removal reservation instance from the database
      await pool.query('DELETE FROM rentals WHERE gameid = $1 AND returnstatus = $2', [id, 'Reserved']);
      
      res.status(200).json({ success: true, message: 'Reservaton is cancelled and game is set to Available.' });       
      } catch (error) {
        console.error('Error ending rental:', error.message);
        res.status(500).json({ success: false, message: 'Error ending rental.' });
      }
      
    });

  module.exports = router;
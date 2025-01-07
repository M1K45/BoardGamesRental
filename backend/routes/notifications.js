const express = require('express');
const router = express.Router();
const pool = require('../db');
const cookieJwtAuth = require('../utils/cookieJwtAuth');
const jwt = require('jsonwebtoken');


// po id pobiera wszystkie gry, których termin zwrotu jest za 2 dni

router.get('/pending/:id', async (req, res) => {
    console.log('CZY JA TU W OGOLE JESTEM?');
    const id = Number(req.params.id); // id użytkownika 

    try {
          const result = await pool.query(`
            SELECT 
                g.title, 
                r.enddate
            FROM 
                rentals r
            JOIN 
                games g ON r.gameid = g.gameid
            WHERE 
                r.userid = $1
                AND r.returnstatus = 'Pending'
                AND r.enddate <= CURRENT_DATE + INTERVAL '2 days'
                AND enddate >= CURRENT_DATE;
          `, [id]);
  
          // console.log('wyniki zapytania: ',result);
  
          if (result.rowCount === 0) {
            return res.status(200).json({ success: true, message: 'No games to return soon.'});

            
          }
          res.status(200).json(result.rows);
  
        } catch (error) {
          console.error('Error fetching end dates:', error.message);
          res.status(500).json({ success: false, message: 'Error fetching end dates.' });
        }
    });

  module.exports = router;
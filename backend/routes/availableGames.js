const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
SELECT 
  g.gameid,
  g.title,
  g.theme,
  g.players,
  g.difficulty,
  g.description,
  -- Priorytetowe zdjęcie
  (SELECT i.image_url
   FROM images i 
   WHERE i.gameid = g.gameid AND i.priority = TRUE
   LIMIT 1) AS primary_image,
  -- Zbiór zdjęć z priority = FALSE
  ARRAY_AGG(i.image_url) FILTER (WHERE i.priority = FALSE) AS all_images
FROM 
  games g
LEFT JOIN 
  images i ON g.gameid = i.gameid
WHERE
  g.status = $1
GROUP BY 
  g.gameid, g.title, g.theme, g.players, g.difficulty, g.description;

      `, ['Available']);
      res.status(200).json(result.rows);
      console.log(result.rows);
    } catch (error) {
      console.error('Error fetching available games:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching available games.' });
    }
  });
  
module.exports = router;
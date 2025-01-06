const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');


// Konfiguracja Multer do przechwytywania plików
const upload = multer({
    dest: '../uploads/', // Tymczasowy katalog lokalny
  });


const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


const s3 = new S3Client({
region: process.env.AWS_BUCKET_REGION,
credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
},
});

router.post('/', upload.single('image'), async (req, res) => {
    // console.log('czy ja tu wgl jestem?')
    try {
      // Przypisanie danych z formularza
      const { title, theme, players, difficulty, description, status } = req.body;
      
      // Pobierz ścieżkę do przesłanego pliku - to wcześniej działało, więc nie zmieniam tego
    //   const filePath = path.join(__dirname, req.file.path);

    const filePath = path.resolve(req.file.path);

  
      // Unikalna nazwa pliku w S3
      const s3Key = `photos/${Date.now()}-${req.file.originalname}`;
  
      // Wczytaj plik jako stream
      const fileStream = fs.createReadStream(filePath);
  
      // Parametry do przesłania pliku do S3
      const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: req.file.mimetype,
      };
  
      // Wyślij plik do S3
      const command = new PutObjectCommand(uploadParams);
      const s3Response = await s3.send(command);
  
      // URL do obrazu w S3
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;
  
      // Usuń lokalny plik po przesłaniu
      fs.unlinkSync(filePath);
  
      // Dodaj grę do bazy danych
      const result = await pool.query(
        'INSERT INTO games (title, theme, players, difficulty, description, status, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, theme, players, difficulty, description, status, imageUrl]
      );
  
      res.status(201).json({ success: true, message: 'Game added successfully.', game: result.rows[0] });
    //   console.log('mogę być tu, i to działa');
    } catch (error) {
    //   console.log('albo tu, wtedy nie działa');
      console.error('Error adding game:', error.message);
      res.status(500).json({ success: false, message: 'Server error while adding game.' });
    }
  });

  module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', upload.fields([{ name: 'priorityImage', maxCount: 1 }, { name: 'additionalImages' }]), async (req, res) => {
  try {
    const { title, theme, players, difficulty, description, status } = req.body;

    // Dodaj grę do tabeli `games`
    const gameResult = await pool.query(
      'INSERT INTO games (title, theme, players, difficulty, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING gameid',
      [title, theme, players, difficulty, description, status]
    );
    const gameId = gameResult.rows[0].gameid;

    // Przesyłanie zdjęcia priorytetowego
    const priorityImageFile = req.files.priorityImage[0];
    const priorityImageUrl = await uploadToS3(priorityImageFile);
    await pool.query('INSERT INTO images (gameid, priority, image_url) VALUES ($1, $2, $3)', [gameId, true, priorityImageUrl]);

    // Przesyłanie dodatkowych zdjęć
    const additionalImages = req.files.additionalImages || [];
    for (const file of additionalImages) {
      const imageUrl = await uploadToS3(file);
      await pool.query('INSERT INTO images (gameid, priority, image_url) VALUES ($1, $2, $3)', [gameId, false, imageUrl]);
    }

    res.status(201).json({ success: true, message: 'Game added successfully.' });
  } catch (error) {
    console.error('Error adding game:', error.message);
    res.status(500).json({ success: false, message: 'Server error while adding game.' });
  }
});

async function uploadToS3(file) {
  const filePath = path.resolve(file.path);
  const s3Key = `photos/${Date.now()}-${file.originalname}`;
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));
  fs.unlinkSync(filePath);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;
}

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Універсальний ендпоінт для завантаження файлів
router.post('/', authMiddleware, upload.array('files', 10), (req, res) => {
  const uploaded = (req.files || []).map(f => ({
    filename: f.originalname,
    url: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size,
  }));
  res.json(uploaded);
});

module.exports = router;

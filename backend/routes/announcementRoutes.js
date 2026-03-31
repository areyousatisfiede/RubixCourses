const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/announcementController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/',                     authMiddleware, ctrl.getAll);
router.post('/',                    authMiddleware, upload.array('files', 5), ctrl.create);
router.put('/:id',                  authMiddleware, ctrl.update);
router.delete('/:id',               authMiddleware, ctrl.remove);
router.get('/:id/comments',         authMiddleware, ctrl.getComments);
router.post('/:id/comments',        authMiddleware, ctrl.addComment);

module.exports = router;

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/assignmentController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20 MB

router.get('/',       authMiddleware, ctrl.getAll);
router.get('/:id',    authMiddleware, ctrl.getById);
router.post('/',      authMiddleware, upload.array('files', 10), ctrl.create);
router.put('/:id',    authMiddleware, upload.array('files', 10), ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;

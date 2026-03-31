const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/submissionController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/',              authMiddleware, ctrl.getAll);
router.get('/:id',           authMiddleware, ctrl.getById);
router.post('/',             authMiddleware, upload.array('files', 5), ctrl.submit);
router.put('/:id/grade',    authMiddleware, ctrl.grade);
router.put('/:id/return',   authMiddleware, ctrl.returnToStudent);

module.exports = router;

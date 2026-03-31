const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/commentController');

router.get('/',  authMiddleware, ctrl.getComments);
router.post('/', authMiddleware, ctrl.addComment);

module.exports = router;

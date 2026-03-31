const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/userController');

router.post('/',      authMiddleware, ctrl.createUser);
router.get('/students', authMiddleware, ctrl.getStudents);
router.post('/batch', authMiddleware, ctrl.getUsersByIds);
router.get('/:uid',   authMiddleware, ctrl.getUser);

module.exports = router;

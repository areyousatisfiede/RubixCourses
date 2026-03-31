const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/notificationController');

router.get('/user/:userId',         authMiddleware, ctrl.getForUser);
router.post('/',                    authMiddleware, ctrl.create);
router.put('/:id/read',             authMiddleware, ctrl.markRead);
router.put('/user/:userId/read-all', authMiddleware, ctrl.markAllRead);
router.delete('/:id',               authMiddleware, ctrl.remove);

module.exports = router;

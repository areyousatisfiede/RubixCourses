const router = require('express').Router();
const { authMiddleware } = require('../middlewares/auth');
const ctrl = require('../controllers/classController');

router.post('/',                     authMiddleware, ctrl.createClass);
router.post('/get-or-create',        authMiddleware, ctrl.getOrCreateClass);
router.get('/teacher/:teacherId',    authMiddleware, ctrl.getClassesByTeacher);
router.get('/student/:studentId',    authMiddleware, ctrl.getClassesForStudent);
router.get('/by-code/:code',         authMiddleware, ctrl.getClassByCode);
router.put('/:id',                   authMiddleware, ctrl.updateClass);
router.delete('/:id',                authMiddleware, ctrl.deleteClass);
router.post('/:id/join',             authMiddleware, ctrl.joinClass);
router.post('/:id/kick',             authMiddleware, ctrl.kickStudent);
router.post('/:id/regen-code',       authMiddleware, ctrl.regenCode);

module.exports = router;

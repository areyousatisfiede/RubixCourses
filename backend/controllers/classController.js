const Class = require('../models/Class');

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function uniqueCode() {
  let code, attempts = 0;
  do {
    code = generateCode();
    const exists = await Class.findOne({ code });
    if (!exists) return code;
    attempts++;
  } while (attempts < 10);
  return code;
}

exports.createClass = async (req, res) => {
  try {
    const { teacherId, teacherName, name, courseName } = req.body;
    const code = await uniqueCode();
    const cls = await Class.create({ teacherId, teacherName, name, courseName, code, studentIds: [] });
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrCreateClass = async (req, res) => {
  try {
    const { teacherId, teacherName, className, courseName } = req.body;
    let cls = await Class.findOne({ teacherId });
    if (cls) return res.json(cls);
    const code = await uniqueCode();
    cls = await Class.create({ teacherId, teacherName, name: className || 'Мій клас', courseName: courseName || '', code, studentIds: [] });
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClassesByTeacher = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClassesForStudent = async (req, res) => {
  try {
    const classes = await Class.find({ studentIds: req.params.studentId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClassByCode = async (req, res) => {
  try {
    const cls = await Class.findOne({ code: req.params.code.toUpperCase().trim() });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    
    // Перевірка прав (якщо є в req.user)
    if (req.user && cls.teacherId !== String(req.user.uid) && cls.teacherId !== String(req.user._id) && cls.teacherId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.body.name !== undefined) cls.name = req.body.name;
    if (req.body.courseName !== undefined) cls.courseName = req.body.courseName;
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    if (req.user && cls.teacherId !== String(req.user.uid) && cls.teacherId !== String(req.user._id) && cls.teacherId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    const { studentId } = req.body;
    if (cls.studentIds.includes(studentId)) return res.json(cls);
    cls.studentIds.push(studentId);
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.kickStudent = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    cls.studentIds = cls.studentIds.filter(id => id !== req.body.studentId);
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.regenCode = async (req, res) => {
  try {
    const code = await uniqueCode();
    const cls = await Class.findByIdAndUpdate(req.params.id, { code }, { new: true });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

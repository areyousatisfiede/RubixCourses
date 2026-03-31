const Assignment = require('../models/Assignment');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.classId) filter.classId = req.query.classId;
    const list = await Assignment.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, dueDate, createdBy, classId } = req.body;
    
    // Валідація прав на клас
    if (classId) {
      const Class = require('../models/Class');
      const cls = await Class.findById(classId);
      if (!cls || (cls.teacherId !== createdBy)) {
        return res.status(403).json({ error: 'Invalid class or access denied' });
      }
    }

    // Прикріплення: файли приходять через multer
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
    }));
    const a = await Assignment.create({
      title, description, dueDate, createdBy, classId, attachments,
    });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = {};
    ['title', 'description', 'dueDate', 'classId'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    // Додаємо нові прикріплення, якщо є
    if (req.files && req.files.length) {
      const newAttachments = req.files.map(f => ({
        filename: f.originalname,
        url: `/uploads/${f.filename}`,
        mimetype: f.mimetype,
      }));
      updates.$push = { attachments: { $each: newAttachments } };
    }
    const a = await Assignment.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

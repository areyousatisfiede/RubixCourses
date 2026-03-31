const Submission = require('../models/Submission');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
    if (req.query.studentId)    filter.studentId = req.query.studentId;
    const list = await Submission.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
    }));
    const fileURL = attachments.length ? attachments[0].url : '';

    // Upsert: якщо вже здавав — оновити
    const sub = await Submission.findOneAndUpdate(
      { assignmentId, studentId },
      {
        fileURL,
        attachments,
        status: 'pending',
        grade: null,
        comment: '',
        returnedAt: null,
        gradedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.grade = async (req, res) => {
  try {
    const { grade, comment } = req.body;
    const sub = await Submission.findByIdAndUpdate(req.params.id, {
      grade: Number(grade),
      comment: comment || '',
      status: 'graded',
      gradedAt: new Date(),
    }, { new: true });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.returnToStudent = async (req, res) => {
  try {
    const { grade, comment } = req.body;
    const update = {
      status: 'returned',
      returnedAt: new Date(),
    };
    if (grade !== undefined) { update.grade = Number(grade); update.gradedAt = new Date(); }
    if (comment !== undefined) update.comment = comment;
    const sub = await Submission.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

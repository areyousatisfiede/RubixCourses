const SubmissionComment = require('../models/SubmissionComment');

exports.getComments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.submissionId) filter.submissionId = req.query.submissionId;
    if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
    const list = await SubmissionComment.find(filter).sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { submissionId, assignmentId, authorId, authorName, role, text } = req.body;
    const c = await SubmissionComment.create({ submissionId, assignmentId, authorId, authorName, role, text });
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

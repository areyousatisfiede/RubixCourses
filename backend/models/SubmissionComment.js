const mongoose = require('mongoose');

const submissionCommentSchema = new mongoose.Schema({
  submissionId: { type: String, required: true, index: true },
  assignmentId: { type: String, default: '' },
  authorId:     { type: String, required: true },
  authorName:   { type: String, default: '' },
  role:         { type: String, enum: ['teacher', 'student'], default: 'student' },
  text:         { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SubmissionComment', submissionCommentSchema);

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url:      String,
  mimetype: String,
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, index: true },
  studentId:    { type: String, required: true, index: true },
  fileURL:      { type: String, default: '' },
  attachments:  [attachmentSchema],                            // файли від студента
  grade:        { type: Number, default: null },
  comment:      { type: String, default: '' },                 // коментар викладача
  status:       { type: String, enum: ['pending', 'graded', 'returned'], default: 'pending' },
  returnedAt:   { type: Date, default: null },
  gradedAt:     { type: Date, default: null },
}, { timestamps: true });

// Один студент — одна здача на завдання
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);

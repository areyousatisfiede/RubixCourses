const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url:      String,
  mimetype: String,
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  dueDate:     { type: Date },
  createdBy:   { type: String, required: true, index: true }, // teacher uid
  classId:     { type: String, default: '' },
  attachments: [attachmentSchema],                            // прикріплені файли/фото
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

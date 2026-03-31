const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  url:      String,
  mimetype: String,
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  title:       { type: String, default: '' },
  body:        { type: String, default: '' },
  authorId:    { type: String, required: true },
  authorName:  { type: String, default: '' },
  pinned:      { type: Boolean, default: false },
  attachments: [attachmentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);

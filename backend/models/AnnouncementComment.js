const mongoose = require('mongoose');

const announcementCommentSchema = new mongoose.Schema({
  announcementId: { type: String, required: true, index: true },
  authorId:       { type: String, required: true },
  authorName:     { type: String, default: '' },
  text:           { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AnnouncementComment', announcementCommentSchema);

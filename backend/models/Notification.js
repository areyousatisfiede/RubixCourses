const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:  { type: String, required: true, index: true },
  type:    { type: String, enum: ['grade', 'comment', 'assignment', 'announcement', 'system'], default: 'system' },
  refId:   { type: String, default: '' },
  message: { type: String, default: '' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

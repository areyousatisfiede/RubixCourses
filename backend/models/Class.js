const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  teacherId:   { type: String, required: true, index: true },
  teacherName: { type: String, default: '' },
  name:        { type: String, default: 'Мій клас' },
  courseName:  { type: String, default: '' },          // Назва курсу від викладача
  code:        { type: String, required: true, unique: true },
  studentIds:  [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);

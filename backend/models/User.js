const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true, index: true },
  password:    { type: String, required: true },
  displayName: { type: String, default: '' },
  role:        { type: String, enum: ['teacher', 'student'], required: true },
}, { timestamps: true });

// Хешуємо пароль перед збереженням
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Метод для порівняння пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Не повертаємо пароль у JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

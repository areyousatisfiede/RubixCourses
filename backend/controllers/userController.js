const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { email, displayName, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      user.displayName = displayName || user.displayName;
      user.role = role || user.role;
      await user.save();
      return res.json(user);
    }
    // Якщо створюємо через цей endpoint, задаємо дефолтний пароль
    user = await User.create({ email, displayName, role, password: 'default123' });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsersByIds = async (req, res) => {
  try {
    const ids = req.body.ids || req.body.uids;
    if (!ids || !ids.length) return res.json([]);
    const users = await User.find({ _id: { $in: ids } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

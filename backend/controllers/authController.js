const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'eduhub-dev-secret-2024';
const JWT_EXPIRES = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * POST /api/auth/register
 * body: { email, password, displayName, role }
 */
exports.register = async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, пароль та роль обовʼязкові' });
    }
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Роль має бути "teacher" або "student"' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Цей email вже зареєстровано' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      displayName: displayName || '',
      role,
    });

    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/auth/login
 * body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email та пароль обовʼязкові' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const token = signToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/auth/me
 * Повертає профіль поточного авторизованого користувача
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

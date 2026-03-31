const Announcement = require('../models/Announcement');
const AnnouncementComment = require('../models/AnnouncementComment');

exports.getAll = async (req, res) => {
  try {
    const list = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, body, authorId, authorName, pinned } = req.body;
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/${f.filename}`,
      mimetype: f.mimetype,
    }));
    const a = await Announcement.create({ title, body, authorId, authorName, pinned, attachments });
    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    await AnnouncementComment.deleteMany({ announcementId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Comments ---
exports.getComments = async (req, res) => {
  try {
    const list = await AnnouncementComment.find({ announcementId: req.params.id }).sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { authorId, authorName, text } = req.body;
    const c = await AnnouncementComment.create({ announcementId: req.params.id, authorId, authorName, text });
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

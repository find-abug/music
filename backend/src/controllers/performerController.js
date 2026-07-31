const { Performer } = require('../models/associations');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, instrument, page = 1, page_size = 50 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { name_zh: { [Op.like]: `%${q}%` } },
      ];
    }
    if (instrument) where.instrument = instrument;
    const { count, rows } = await Performer.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
    });
    res.json({ total: count, page: parseInt(page), data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.detail = async (req, res) => {
  try {
    const performer = await Performer.findByPk(req.params.id);
    if (!performer) return res.status(404).json({ error: '演奏家不存在' });
    res.json(performer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const performer = await Performer.create(req.body);
    res.status(201).json(performer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const performer = await Performer.findByPk(req.params.id);
    if (!performer) return res.status(404).json({ error: '演奏家不存在' });
    await performer.update(req.body);
    res.json(performer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const performer = await Performer.findByPk(req.params.id);
    if (!performer) return res.status(404).json({ error: '演奏家不存在' });
    await performer.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { Venue } = require('../models/associations');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, city, page = 1, page_size = 50 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { name_zh: { [Op.like]: `%${q}%` } },
      ];
    }
    if (city) where.city = city;
    const { count, rows } = await Venue.findAndCountAll({
      where,
      order: [['city', 'ASC'], ['name', 'ASC']],
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
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: '演出场所不存在' });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: '演出场所不存在' });
    await venue.update(req.body);
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) return res.status(404).json({ error: '演出场所不存在' });
    await venue.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

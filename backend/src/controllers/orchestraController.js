const { Orchestra } = require('../models/associations');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, country, page = 1, page_size = 50 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { name_zh: { [Op.like]: `%${q}%` } },
      ];
    }
    if (country) where.country = country;
    const { count, rows } = await Orchestra.findAndCountAll({
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
    const orchestra = await Orchestra.findByPk(req.params.id);
    if (!orchestra) return res.status(404).json({ error: '乐团不存在' });
    res.json(orchestra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const orchestra = await Orchestra.create(req.body);
    res.status(201).json(orchestra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const orchestra = await Orchestra.findByPk(req.params.id);
    if (!orchestra) return res.status(404).json({ error: '乐团不存在' });
    await orchestra.update(req.body);
    res.json(orchestra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const orchestra = await Orchestra.findByPk(req.params.id);
    if (!orchestra) return res.status(404).json({ error: '乐团不存在' });
    await orchestra.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { Conductor } = require('../models/associations');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { q, page = 1, page_size = 50 } = req.query;
    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { name_zh: { [Op.like]: `%${q}%` } },
      ];
    }
    const { count, rows } = await Conductor.findAndCountAll({
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
    const conductor = await Conductor.findByPk(req.params.id);
    if (!conductor) return res.status(404).json({ error: '指挥家不存在' });
    res.json(conductor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const conductor = await Conductor.create(req.body);
    res.status(201).json(conductor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id);
    if (!conductor) return res.status(404).json({ error: '指挥家不存在' });
    await conductor.update(req.body);
    res.json(conductor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const conductor = await Conductor.findByPk(req.params.id);
    if (!conductor) return res.status(404).json({ error: '指挥家不存在' });
    await conductor.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

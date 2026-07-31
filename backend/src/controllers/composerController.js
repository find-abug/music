const { Composer } = require('../models/associations');
const { Op } = require('sequelize');

// 列表（支持搜索和分页）
exports.list = async (req, res) => {
  try {
    const { q, era, page = 1, page_size = 50 } = req.query;
    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { name_zh: { [Op.like]: `%${q}%` } },
      ];
    }
    if (era) where.era = era;

    const { count, rows } = await Composer.findAndCountAll({
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

// 详情
exports.detail = async (req, res) => {
  try {
    const composer = await Composer.findByPk(req.params.id);
    if (!composer) return res.status(404).json({ error: '作曲家不存在' });
    res.json(composer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 新增
exports.create = async (req, res) => {
  try {
    const composer = await Composer.create(req.body);
    res.status(201).json(composer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新
exports.update = async (req, res) => {
  try {
    const composer = await Composer.findByPk(req.params.id);
    if (!composer) return res.status(404).json({ error: '作曲家不存在' });
    await composer.update(req.body);
    res.json(composer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除
exports.remove = async (req, res) => {
  try {
    const composer = await Composer.findByPk(req.params.id);
    if (!composer) return res.status(404).json({ error: '作曲家不存在' });
    await composer.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

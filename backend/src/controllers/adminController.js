const { Op } = require('sequelize');
const {
  Performance, Venue, Orchestra, Conductor, Composer, Performer,
  PerformancePiece, PerformancePerformer,
} = require('../models/associations');

/**
 * 待审核演出列表
 */
exports.pendingList = async (req, res) => {
  try {
    const { page = 1, page_size = 20 } = req.query;
    const { count, rows } = await Performance.findAndCountAll({
      where: { source_verified: false, status: { [Op.ne]: 'cancelled' } },
      include: [
        { model: Venue, as: 'venue' },
        { model: Orchestra, as: 'orchestra' },
        { model: Conductor, as: 'conductor' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
    });
    res.json({ total: count, page: parseInt(page), data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 审核通过
 */
exports.verify = async (req, res) => {
  try {
    const perf = await Performance.findByPk(req.params.id);
    if (!perf) return res.status(404).json({ error: '演出不存在' });
    await perf.update({ source_verified: true, status: 'published' });
    res.json({ message: '审核通过，已发布' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 驳回
 */
exports.reject = async (req, res) => {
  try {
    const perf = await Performance.findByPk(req.params.id);
    if (!perf) return res.status(404).json({ error: '演出不存在' });
    await perf.update({ status: 'cancelled' });
    res.json({ message: '已驳回' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 数据统计
 */
exports.stats = async (req, res) => {
  try {
    const totalPerfs = await Performance.count();
    const publishedPerfs = await Performance.count({ where: { status: 'published' } });
    const pendingPerfs = await Performance.count({ where: { source_verified: false } });
    const totalComposers = await Composer.count();
    const totalConductors = await Conductor.count();
    const totalPerformers = await Performer.count();
    const totalOrchestras = await Orchestra.count();
    const totalVenues = await Venue.count();

    // 即将上演（未来7天）
    const upcoming = await Performance.count({
      where: {
        status: 'published',
        date_time: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      performances: { total: totalPerfs, published: publishedPerfs, pending: pendingPerfs, upcoming },
      composers: totalComposers,
      conductors: totalConductors,
      performers: totalPerformers,
      orchestras: totalOrchestras,
      venues: totalVenues,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

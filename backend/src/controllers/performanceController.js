const { Op } = require('sequelize');
const {
  Performance, Venue, Orchestra, Conductor, Composer, Performer,
  PerformancePiece, PerformancePerformer,
} = require('../models/associations');

/**
 * 演出列表 — 支持多条件组合筛选
 *
 * 筛选参数:
 *   composer_id   — 作曲家ID
 *   conductor_id  — 指挥家ID
 *   performer_id  — 演奏家ID
 *   orchestra_id  — 乐团ID
 *   venue_id      — 演出场所ID
 *   city          — 城市
 *   date_from     — 开始日期
 *   date_to       — 截止日期
 *   q             — 关键词
 *   status        — 状态
 *   page / page_size
 */
exports.list = async (req, res) => {
  try {
    const {
      composer_id, conductor_id, performer_id, orchestra_id, venue_id,
      city, date_from, date_to, q, status,
      page = 1, page_size = 20,
    } = req.query;

    // ---- Step 1: 构建主表 WHERE 条件 ----
    const perfWhere = {};

    if (conductor_id) perfWhere.conductor_id = parseInt(conductor_id);
    if (orchestra_id) perfWhere.orchestra_id = parseInt(orchestra_id);
    if (venue_id) perfWhere.venue_id = parseInt(venue_id);
    if (status) perfWhere.status = status;

    // 日期范围
    if (date_from || date_to) {
      perfWhere.date_time = {};
      if (date_from) perfWhere.date_time[Op.gte] = new Date(date_from);
      if (date_to) perfWhere.date_time[Op.lte] = new Date(date_to + ' 23:59:59');
    }

    // 关键词（标题/副标题/描述）
    if (q) {
      perfWhere[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { subtitle: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    // ---- Step 2: 处理需要子查询的筛选（composer_id, performer_id, city） ----
    // 这些不能直接放到 perfWhere，因为需要跨越关联表查询
    // 改为先查出匹配的 performance IDs，再合并到主查询

    let candidateIds = null; // null = 无限制

    // composer_id: 查 performance_pieces 表 + 文本匹配（防漏关联）
    if (composer_id) {
      const cid = parseInt(composer_id);

      // 1. 查找作曲家名字
      const composer = await Composer.findByPk(cid, { attributes: ['name', 'name_zh'] });

      // 2. 查曲目关联表
      const pieces = await PerformancePiece.findAll({
        where: { composer_id: cid },
        attributes: ['performance_id'],
      });
      const linkedIds = [...new Set(pieces.map(p => p.performance_id))];

      // 3. 用作曲家名字在演出文本中搜索（捕获未关联但提及的演出）
      let textIds = [];
      if (composer) {
        const nameConds = [];
        const names = [composer.name_zh, composer.name].filter(Boolean);
        for (const n of names) {
          nameConds.push({ title: { [Op.like]: `%${n}%` } });
          nameConds.push({ subtitle: { [Op.like]: `%${n}%` } });
          nameConds.push({ description: { [Op.like]: `%${n}%` } });
          nameConds.push({ program_notes: { [Op.like]: `%${n}%` } });
        }
        if (nameConds.length > 0) {
          const textPerfs = await Performance.findAll({
            where: { [Op.or]: nameConds },
            attributes: ['id'],
          });
          textIds = textPerfs.map(p => p.id);
        }
      }

      // 合并关联ID 与 文本匹配ID
      const ids = [...new Set([...linkedIds, ...textIds])];
      candidateIds = candidateIds === null ? ids : candidateIds.filter(id => ids.includes(id));
    }

    // performer_id: 查 performance_performers 表 + 文本匹配（防漏关联）
    if (performer_id) {
      const pid = parseInt(performer_id);

      // 1. 查找演奏家名字
      const performer = await Performer.findByPk(pid, { attributes: ['name', 'name_zh'] });

      // 2. 查关联表
      const pps = await PerformancePerformer.findAll({
        where: { performer_id: pid },
        attributes: ['performance_id'],
      });
      const linkedIds = [...new Set(pps.map(p => p.performance_id))];

      // 3. 用演奏家名字在演出文本中搜索（捕获未关联但提及的演出）
      let textIds = [];
      if (performer) {
        const nameConds = [];
        const names = [performer.name_zh, performer.name].filter(Boolean);
        for (const n of names) {
          nameConds.push({ title: { [Op.like]: `%${n}%` } });
          nameConds.push({ subtitle: { [Op.like]: `%${n}%` } });
          nameConds.push({ description: { [Op.like]: `%${n}%` } });
          nameConds.push({ program_notes: { [Op.like]: `%${n}%` } });
        }
        if (nameConds.length > 0) {
          const textPerfs = await Performance.findAll({
            where: { [Op.or]: nameConds },
            attributes: ['id'],
          });
          textIds = textPerfs.map(p => p.id);
        }
      }

      // 合并关联ID 与 文本匹配ID
      const ids = [...new Set([...linkedIds, ...textIds])];
      candidateIds = candidateIds === null ? ids : candidateIds.filter(id => ids.includes(id));
    }

    // city: 查 venues 表找到 venue IDs，再匹配
    if (city) {
      const cityVenues = await Venue.findAll({
        where: { city },
        attributes: ['id'],
      });
      const venueIds = cityVenues.map(v => v.id);
      if (venueIds.length > 0) {
        const perfs = await Performance.findAll({
          where: { venue_id: { [Op.in]: venueIds } },
          attributes: ['id'],
        });
        const ids = perfs.map(p => p.id);
        candidateIds = candidateIds === null ? ids : candidateIds.filter(id => ids.includes(id));
      } else {
        candidateIds = []; // 城市不存在，无结果
      }
    }

    // 如果有子查询结果，合并到主 WHERE
    if (candidateIds !== null) {
      if (candidateIds.length === 0) {
        // 无匹配，直接返回空
        return res.json({ total: 0, page: parseInt(page), page_size: parseInt(page_size), total_pages: 0, data: [] });
      }
      // 如果已有 id 条件（来自 q 的 OR），需要用 AND 组合
      if (perfWhere.id) {
        // 已有 id 过滤，取交集
        const existingIds = Array.isArray(perfWhere.id[Op.in]) ? perfWhere.id[Op.in] : [];
        const merged = existingIds.filter(id => candidateIds.includes(id));
        perfWhere.id = { [Op.in]: merged.length > 0 ? merged : [-1] };
      } else {
        perfWhere.id = { [Op.in]: candidateIds };
      }
    }

    // ---- Step 3: 查询（include 不再带筛选条件，纯展示用） ----
    const include = [
      { model: Venue, as: 'venue', attributes: ['id', 'name', 'name_zh', 'city', 'district'] },
      { model: Orchestra, as: 'orchestra', attributes: ['id', 'name', 'name_zh', 'country'] },
      { model: Conductor, as: 'conductor', attributes: ['id', 'name', 'name_zh'] },
      {
        model: PerformancePiece, as: 'pieces',
        attributes: ['id', 'piece_name', 'piece_name_zh', 'sort_order', 'composer_id'],
        include: [{ model: Composer, as: 'composer', attributes: ['id', 'name', 'name_zh', 'era'] }],
      },
      {
        model: PerformancePerformer, as: 'performancePerformers',
        attributes: ['id', 'role', 'instrument'],
        include: [{ model: Performer, as: 'performer', attributes: ['id', 'name', 'name_zh', 'instrument'] }],
      },
    ];

    const { count, rows } = await Performance.findAndCountAll({
      where: perfWhere,
      include,
      order: [['date_time', 'ASC']],
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      distinct: true,
    });

    res.json({
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size),
      total_pages: Math.ceil(count / parseInt(page_size)),
      data: rows,
    });
  } catch (error) {
    console.error('查询演出失败:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 演出详情
 */
exports.detail = async (req, res) => {
  try {
    const performance = await Performance.findByPk(req.params.id, {
      include: [
        { model: Venue, as: 'venue', attributes: ['id', 'name', 'name_zh', 'city', 'district', 'address'] },
        { model: Orchestra, as: 'orchestra', attributes: ['id', 'name', 'name_zh', 'country', 'description'] },
        { model: Conductor, as: 'conductor', attributes: ['id', 'name', 'name_zh', 'nationality', 'bio'] },
        {
          model: PerformancePiece, as: 'pieces',
          include: [{ model: Composer, as: 'composer', attributes: ['id', 'name', 'name_zh', 'era'] }],
        },
        {
          model: PerformancePerformer, as: 'performancePerformers',
          include: [{ model: Performer, as: 'performer', attributes: ['id', 'name', 'name_zh', 'instrument'] }],
        },
      ],
    });
    if (!performance) return res.status(404).json({ error: '演出不存在' });
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 新增演出
 */
exports.create = async (req, res) => {
  try {
    const { pieces, performers, ...perfData } = req.body;
    const performance = await Performance.create(perfData);
    if (pieces && pieces.length > 0) {
      await PerformancePiece.bulkCreate(
        pieces.map((p, i) => ({ ...p, performance_id: performance.id, sort_order: i }))
      );
    }
    if (performers && performers.length > 0) {
      await PerformancePerformer.bulkCreate(
        performers.map(p => ({ ...p, performance_id: performance.id }))
      );
    }
    const full = await Performance.findByPk(performance.id, {
      include: [
        { model: Venue, as: 'venue' }, { model: Orchestra, as: 'orchestra' },
        { model: Conductor, as: 'conductor' },
        { model: PerformancePiece, as: 'pieces', include: [{ model: Composer, as: 'composer' }] },
        { model: PerformancePerformer, as: 'performancePerformers', include: [{ model: Performer, as: 'performer' }] },
      ],
    });
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新演出
 */
exports.update = async (req, res) => {
  try {
    const performance = await Performance.findByPk(req.params.id);
    if (!performance) return res.status(404).json({ error: '演出不存在' });
    const { pieces, performers, ...perfData } = req.body;
    await performance.update(perfData);
    if (pieces !== undefined) {
      await PerformancePiece.destroy({ where: { performance_id: performance.id } });
      if (pieces.length > 0) {
        await PerformancePiece.bulkCreate(
          pieces.map((p, i) => ({ ...p, performance_id: performance.id, sort_order: i }))
        );
      }
    }
    if (performers !== undefined) {
      await PerformancePerformer.destroy({ where: { performance_id: performance.id } });
      if (performers.length > 0) {
        await PerformancePerformer.bulkCreate(
          performers.map(p => ({ ...p, performance_id: performance.id }))
        );
      }
    }
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除演出
 */
exports.remove = async (req, res) => {
  try {
    const performance = await Performance.findByPk(req.params.id);
    if (!performance) return res.status(404).json({ error: '演出不存在' });
    await performance.destroy();
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

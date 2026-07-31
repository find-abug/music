const { Op } = require('sequelize');
const {
  Performance, Venue, Orchestra, Conductor, Composer, Performer,
  PerformancePiece, PerformancePerformer,
} = require('../models/associations');

// ============================================================
// 古典音乐简称词典
// ============================================================
const COMPOSER_MAP = {
  '贝': '贝多芬', '贝多': '贝多芬',
  '莫': '莫扎特', '莫扎': '莫扎特',
  '巴赫': '巴赫', '巴': '巴赫',
  '柴': '柴可夫斯基', '老柴': '柴可夫斯基',
  '拉': '拉赫玛尼诺夫', '拉赫': '拉赫玛尼诺夫',
  '肖': '肖邦',
  '肖斯': '肖斯塔科维奇', '老肖': '肖斯塔科维奇',
  '勃': '勃拉姆斯', '勃拉': '勃拉姆斯',
  '马': '马勒',
  '德': '德沃夏克', '德沃': '德沃夏克',
  '德彪': '德彪西',
  '舒': '舒伯特', '舒伯': '舒伯特',
  '舒曼': '舒曼',
  '布': '布鲁克纳', '布鲁': '布鲁克纳',
  '普': '普罗科菲耶夫', '普罗': '普罗科菲耶夫',
  '海': '海顿',
  '韦': '韦伯',
  '瓦': '瓦格纳',
  '威': '威尔第',
  '比': '比才',
  '圣': '圣桑',
  '斯': '斯特拉文斯基', '斯特': '斯特拉文斯基',
  '西': '西贝柳斯',
  '门': '门德尔松',
  '柏': '柏辽兹',
  '格': '格里格',
  '维': '维瓦尔第',
  '亨': '亨德尔',
  '理': '理查·施特劳斯',
  '埃尔': '埃尔加',
  '巴托': '巴托克',
  '里姆': '里姆斯基-科萨科夫',
  '穆索': '穆索尔斯基',
};

const NUMBER_MAP = {
  '一': '第一', '二': '第二', '三': '第三', '四': '第四',
  '五': '第五', '六': '第六', '七': '第七', '八': '第八', '九': '第九',
  '1': '第一', '2': '第二', '3': '第三', '4': '第四',
  '5': '第五', '6': '第六', '7': '第七', '8': '第八', '9': '第九',
};

const GENRE_MAP = {
  '交': '交响曲', '钢协': '钢琴协奏曲', '小协': '小提琴协奏曲',
  '大协': '大提琴协奏曲', '协奏': '协奏曲', '序': '序曲',
  '组曲': '组曲', '奏': '奏鸣曲', '四重': '四重奏', '三重': '三重奏',
  '歌剧': '歌剧', '合唱': '合唱', '弥撒': '弥撒', '安魂': '安魂曲',
  '随想': '随想曲', '狂想': '狂想曲', '变奏': '变奏曲',
  '夜曲': '夜曲', '即兴': '即兴曲', '练习曲': '练习曲',
  '叙事': '叙事曲', '圆舞': '圆舞曲', '进行': '进行曲',
  '波尔卡': '波尔卡', '波罗乃': '波罗乃兹', '玛祖卡': '玛祖卡',
  '选段': '选段', '套曲': '套曲',
};

/**
 * 展开简称 → { composer?, number?, genre?, keywords[] }
 */
function parseAbbreviation(query) {
  const result = { keywords: [query] };

  // 匹配作曲家前缀
  for (const [short, full] of Object.entries(COMPOSER_MAP).sort((a,b) => b[0].length - a[0].length)) {
    if (query.startsWith(short)) {
      result.composer = full;
      result.keywords.push(full);
      query = query.slice(short.length);
      break;
    }
  }

  // 匹配数字（可以在任意位置）
  for (const [num, full] of Object.entries(NUMBER_MAP).sort((a,b) => b[0].length - a[0].length)) {
    if (query.includes(num)) {
      result.number = full;
      result.keywords.push(full);
      query = query.replace(num, '');
      break;
    }
  }

  // 匹配体裁
  for (const [short, full] of Object.entries(GENRE_MAP).sort((a,b) => b[0].length - a[0].length)) {
    if (query.includes(short)) {
      result.genre = full;
      result.keywords.push(full);
      query = query.replace(short, '');
      break;
    }
  }

  // 构建组合关键词
  if (result.composer && result.number) {
    result.keywords.push(`${result.composer} ${result.number}`);
    if (result.genre) {
      result.keywords.push(`${result.composer} ${result.number}${result.genre}`);
    }
  }
  if (result.composer && result.genre && !result.number) {
    result.keywords.push(`${result.composer} ${result.genre}`);
  }

  return result;
}

/**
 * 检查演出文本匹配了多少个关键词，返回匹配数
 */
function countMatches(perfText, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (perfText.includes(kw)) score++;
  }
  return score;
}

// ============================================================
// 主搜索接口（评分排序版）
// ============================================================
exports.search = async (req, res) => {
  try {
    const { q, page = 1, page_size = 20 } = req.query;
    if (!q || !q.trim()) {
      return res.json({ total: 0, data: [] });
    }

    const keyword = q.trim();
    const abbr = parseAbbreviation(keyword);
    const keywords = abbr.keywords;
    console.log(`搜索 "${keyword}" → 展开: [${keywords.join(', ')}]`);

    // 收集所有候选演出ID（宽泛匹配）
    const candidateScores = new Map(); // id → score

    for (const term of keywords) {
      const like = `%${term}%`;

      // 匹配演出文本
      const titleMatches = await Performance.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: like } },
            { subtitle: { [Op.like]: like } },
            { description: { [Op.like]: like } },
            { program_notes: { [Op.like]: like } },
          ],
        },
        attributes: ['id', 'title', 'subtitle', 'description', 'program_notes'],
      });
      for (const p of titleMatches) {
        const text = [p.title, p.subtitle, p.description, p.program_notes].join(' ');
        const s = countMatches(text, keywords);
        candidateScores.set(p.id, (candidateScores.get(p.id) || 0) + s);
      }

      // 匹配指挥家 → 演出
      const conductors = await Conductor.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { name_zh: { [Op.like]: like } }] },
        attributes: ['id', 'name_zh'],
      });
      for (const c of conductors) {
        const perfs = await Performance.findAll({ where: { conductor_id: c.id }, attributes: ['id', 'title', 'subtitle', 'description', 'program_notes'] });
        for (const p of perfs) {
          const text = [p.title, p.subtitle, p.description, p.program_notes, c.name_zh].join(' ');
          const s = countMatches(text, keywords);
          candidateScores.set(p.id, (candidateScores.get(p.id) || 0) + s);
        }
      }

      // 匹配演奏家 → 演出
      const performers = await Performer.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { name_zh: { [Op.like]: like } }] },
        attributes: ['id', 'name_zh'],
      });
      for (const pr of performers) {
        const pps = await PerformancePerformer.findAll({ where: { performer_id: pr.id }, attributes: ['performance_id'] });
        for (const pp of pps) {
          candidateScores.set(pp.performance_id, (candidateScores.get(pp.performance_id) || 0) + 2);
        }
      }

      // 匹配乐团 → 演出
      const orchestras = await Orchestra.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { name_zh: { [Op.like]: like } }] },
        attributes: ['id'],
      });
      for (const o of orchestras) {
        const perfs = await Performance.findAll({ where: { orchestra_id: o.id }, attributes: ['id'] });
        for (const p of perfs) {
          candidateScores.set(p.id, (candidateScores.get(p.id) || 0) + 1);
        }
      }

      // 匹配场所 → 演出
      const venues = await Venue.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { name_zh: { [Op.like]: like } }, { city: { [Op.like]: like } }] },
        attributes: ['id'],
      });
      for (const v of venues) {
        const perfs = await Performance.findAll({ where: { venue_id: v.id }, attributes: ['id'] });
        for (const p of perfs) {
          candidateScores.set(p.id, (candidateScores.get(p.id) || 0) + 1);
        }
      }

      // 匹配作曲家 → 曲目 → 演出
      const composers = await Composer.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { name_zh: { [Op.like]: like } }] },
        attributes: ['id'],
      });
      for (const c of composers) {
        const pieces = await PerformancePiece.findAll({ where: { composer_id: c.id }, attributes: ['performance_id'] });
        for (const p of pieces) {
          candidateScores.set(p.performance_id, (candidateScores.get(p.performance_id) || 0) + 2);
        }
      }

      // 匹配曲目名
      const pieces = await PerformancePiece.findAll({
        where: { [Op.or]: [{ piece_name: { [Op.like]: like } }, { piece_name_zh: { [Op.like]: like } }] },
        attributes: ['performance_id', 'piece_name', 'piece_name_zh'],
      });
      for (const p of pieces) {
        const text = [p.piece_name, p.piece_name_zh].join(' ');
        const s = countMatches(text, keywords);
        candidateScores.set(p.performance_id, (candidateScores.get(p.performance_id) || 0) + s);
      }
    }

    // 按分数降序排列
    const sorted = [...candidateScores.entries()]
      .sort((a, b) => b[1] - a[1]);

    // 如果是简称搜索（展开词≥3），过滤掉只匹配1个词的（噪声）
    const minScore = keywords.length >= 3 ? 2 : 1;
    const filtered = sorted.filter(([, score]) => score >= minScore);

    if (filtered.length === 0) {
      return res.json({ total: 0, data: [], page: 1 });
    }

    // 分页
    const start = (parseInt(page) - 1) * parseInt(page_size);
    const pageIds = filtered.slice(start, start + parseInt(page_size)).map(([id]) => id);

    // 查询完整数据并保持排序
    const rows = await Performance.findAll({
      where: { id: { [Op.in]: pageIds }, status: 'published' },
      include: [
        { model: Venue, as: 'venue', attributes: ['id', 'name', 'name_zh', 'city'] },
        { model: Orchestra, as: 'orchestra', attributes: ['id', 'name', 'name_zh'] },
        { model: Conductor, as: 'conductor', attributes: ['id', 'name', 'name_zh'] },
        {
          model: PerformancePiece, as: 'pieces',
          include: [{ model: Composer, as: 'composer', attributes: ['id', 'name', 'name_zh'] }],
        },
        {
          model: PerformancePerformer, as: 'performancePerformers',
          include: [{ model: Performer, as: 'performer', attributes: ['id', 'name', 'name_zh', 'instrument'] }],
        },
      ],
    });

    // 按分数排序
    const scoreById = new Map(filtered);
    rows.sort((a, b) => (scoreById.get(b.id) || 0) - (scoreById.get(a.id) || 0));

    res.json({
      total: filtered.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
      total_pages: Math.ceil(filtered.length / parseInt(page_size)),
      data: rows,
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({ error: error.message });
  }
};

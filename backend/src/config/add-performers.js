/**
 * 补充演奏家关联数据 — 把演出中的独奏家信息录入 performance_performers 表
 */
const sequelize = require('./database');
const {
  Performance, Performer, PerformancePerformer,
  PerformancePiece, Composer, Venue, Orchestra, Conductor,
} = require('../models/associations');

async function add() {
  await sequelize.sync();

  // ---- 确保所有独奏家存在 ----
  const ensure = async (name, nameZh, instrument, nationality) => {
    const [p] = await Performer.findOrCreate({
      where: { name_zh: nameZh },
      defaults: { name, name_zh: nameZh, instrument, nationality: nationality || '中国' },
    });
    return p;
  };

  console.log('确保演奏家数据...');
  const perfMap = {
    langlang: await ensure('Lang Lang', '郎朗', '钢琴', '中国'),
    wangyujia: await ensure('Yuja Wang', '王羽佳', '钢琴', '中国'),
    yoyoma: await ensure('Yo-Yo Ma', '马友友', '大提琴', '美国'),
    mutter: await ensure('Anne-Sophie Mutter', '穆特', '小提琴', '德国'),
    yunchan: await ensure('Yunchan Lim', '林允灿', '钢琴', '韩国'),
    hahn: await ensure('Hilary Hahn', '希拉里·哈恩', '小提琴', '美国'),
    liyundi: await ensure('Li Yundi', '李云迪', '钢琴', '中国'),
    ningfeng: await ensure('Ning Feng', '宁峰', '小提琴', '中国'),
    wangjian: await ensure('Wang Jian', '王健', '大提琴', '中国'),
    argerich: await ensure('Martha Argerich', '阿格里奇', '钢琴', '阿根廷'),
    wanjieni: await ensure('Wan Jieni', '万捷旎', '钢琴', '中国'),
    zengyun: await ensure('Zeng Yun', '曾韵', '圆号', '中国'),
    wuwei: await ensure('Wu Wei', '吴巍', '笙', '中国'),
    liyuhe: await ensure('Li Yuhe', '黎雨荷', '小提琴', '中国'),
    juxiaofu: await ensure('Ju Xiaofu', '鞠小夫', '钢琴', '中国'),
    lijingjing: await ensure('Li Jingjing', '李晶晶', '声乐', '中国'),
    songsiheng: await ensure('Song Siheng', '宋思衡', '钢琴', '中国'),
    liuhao: await ensure('Liu Hao', '刘浩', '钢琴', '中国'),
    gregory: await ensure('Sophia Gregory', '索菲娅·格雷戈里', '管风琴', '德国'),
    zhangaoze: await ensure('Zhang Aoze', '章奥哲', '小提琴', '中国'),
  };

  // ---- 演出 → 演奏家映射 ----
  const mappings = [
    // 莫扎特之夜 → 郎朗 (钢琴)
    { title: '莫扎特之夜 — 钢琴协奏曲专场', performers: [{ p: perfMap.langlang, role: '独奏', instrument: '钢琴' }] },

    // 纪念肖斯塔科维奇 → 万捷旎 (钢琴)
    { title: '纪念肖斯塔科维奇诞辰120周年', performers: [{ p: perfMap.wanjieni, role: '独奏', instrument: '钢琴' }] },

    // 余隆+曾韵 → 曾韵 (圆号)
    { title: '余隆、曾韵与国家大剧院管弦乐团', performers: [{ p: perfMap.zengyun, role: '独奏', instrument: '圆号' }] },

    // 贝多芬+蒂恩苏 → 吴巍(笙) + 格雷戈里(管风琴)
    { title: '漫步经典：演绎贝多芬与蒂恩苏', performers: [
      { p: perfMap.wuwei, role: '独奏', instrument: '笙' },
      { p: perfMap.gregory, role: '独奏', instrument: '管风琴' },
    ]},

    // 夏日激情 → 黎雨荷 (小提琴)
    { title: '"夏日激情" — 金野、黎雨荷与中国音乐学院交响乐团', performers: [{ p: perfMap.liyuhe, role: '独奏', instrument: '小提琴' }] },

    // 欢乐颂 → 鞠小夫 (钢琴)
    { title: '贝多芬第九交响曲"欢乐颂"', performers: [{ p: perfMap.juxiaofu, role: '独奏', instrument: '钢琴' }] },

    // 少年的号角 → 李晶晶 (女高音)
    { title: '漫步经典闭幕："少年的号角"', performers: [{ p: perfMap.lijingjing, role: '独唱', instrument: '声乐' }] },

    // 台湖 → 宋思衡 (钢琴)
    { title: '台湖星期音乐会·《来自地球的钢琴诗》', performers: [{ p: perfMap.songsiheng, role: '独奏', instrument: '钢琴' }] },

    // 指尖上的阳光 → 刘浩 (钢琴)
    { title: '"指尖上的阳光" — 刘浩钢琴独奏音乐会', performers: [{ p: perfMap.liuhao, role: '独奏', instrument: '钢琴' }] },

    // 广青交 → 章奥哲 (小提琴)
    { title: '庆祝广州青年交响乐团成立15周年 — 景焕、章奥哲与广青交湾区巡演（深圳站）', performers: [{ p: perfMap.zhangaoze, role: '独奏', instrument: '小提琴' }] },

    // 巴赫大提琴 → 王健
    { title: '巴赫无伴奏大提琴组曲全集', performers: [{ p: perfMap.wangjian, role: '独奏', instrument: '大提琴' }] },

    // 德沃夏克+肖邦 → 李云迪
    { title: '德沃夏克第九交响曲"自新大陆"', performers: [{ p: perfMap.liyundi, role: '独奏', instrument: '钢琴' }] },
  ];

  console.log('\n添加演奏家关联...');
  let added = 0;
  for (const m of mappings) {
    const perf = await Performance.findOne({ where: { title: m.title } });
    if (!perf) {
      console.log(`  ? 未找到演出: ${m.title}`);
      continue;
    }

    for (const { p, role, instrument } of m.performers) {
      // 检查是否已存在
      const existing = await PerformancePerformer.findOne({
        where: { performance_id: perf.id, performer_id: p.id },
      });
      if (!existing) {
        await PerformancePerformer.create({
          performance_id: perf.id,
          performer_id: p.id,
          role: role || '独奏',
          instrument: instrument || p.instrument,
        });
        console.log(`  + ${perf.title.substring(0,30)}... ← ${p.name_zh} (${instrument || p.instrument})`);
        added++;
      } else {
        console.log(`  ~ ${perf.title.substring(0,30)}... ← ${p.name_zh} (已存在)`);
      }
    }
  }

  const total = await PerformancePerformer.count();
  const perfWith = await Performance.count({
    include: [{ model: PerformancePerformer, as: 'performancePerformers', required: true }],
    distinct: true,
  });

  console.log(`\nDone! 新增 ${added} 条关联`);
  console.log(`演奏家关联总数: ${total}, 含演奏家的演出: ${perfWith}`);

  // 验证搜索
  const jxf = await Performer.findOne({ where: { name_zh: '鞠小夫' } });
  if (jxf) {
    const pps = await PerformancePerformer.findAll({ where: { performer_id: jxf.id } });
    console.log(`\n验证: 鞠小夫 关联了 ${pps.length} 场演出`);
    for (const pp of pps) {
      const p = await Performance.findByPk(pp.performance_id);
      if (p) console.log(`  - ${p.title}`);
    }
  }

  process.exit(0);
}

add().catch(e => { console.error(e); process.exit(1); });

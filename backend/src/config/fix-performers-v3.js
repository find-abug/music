/**
 * 修复演奏家关联 v3
 * 扫描 title + subtitle + description，补全遗漏的关联
 */
const {
  Performance, Performer, PerformancePerformer,
} = require('../models/associations');

// 已知演奏家 → 在文本中搜索他们
async function main() {
  console.log('扫描所有演出，补全遗漏的演奏家关联...\n');

  // 获取所有演奏家
  const allPerformers = await Performer.findAll();
  console.log(`演奏家总数: ${allPerformers.length}`);

  let added = 0;
  let totalChecked = 0;

  for (const performer of allPerformers) {
    const nameZh = performer.name_zh;
    if (!nameZh || nameZh.length < 2) continue;

    // 找所有标题/描述中含该演奏家名字的演出
    const allPerfs = await Performance.findAll();
    for (const perf of allPerfs) {
      const text = (perf.title || '') + ' ' + (perf.subtitle || '') + ' ' + (perf.description || '') + ' ' + (perf.program_notes || '');

      if (!text.includes(nameZh)) continue;

      // 检查是否已有关联
      const existing = await PerformancePerformer.findOne({
        where: { performance_id: perf.id, performer_id: performer.id },
      });
      if (existing) continue;

      // 确认这是真正的演奏家身份（不是指挥或其他）
      // 排除：名字前面是 "指挥"（那是指挥家）、名字在乐团名中
      const idx = text.indexOf(nameZh);
      const before = text.substring(Math.max(0, idx - 8), idx);

      // 跳过如果前面有"指挥"（说明这人是指挥不是演奏家）
      if (/指挥[：:]?\s*$/.test(before)) continue;
      // 跳过如果在乐团名后面
      if (/乐团[）)]?\s*$/.test(before)) continue;

      // 从文本推断乐器
      let instrument = performer.instrument || '';
      if (!instrument) {
        const instMatch = text.substring(Math.max(0, idx - 15), idx + nameZh.length + 5)
          .match(/(钢琴|小提琴|中提琴|大提琴|圆号|小号|长号|大管|单簧管|双簧管|长笛|竖琴|管风琴|笙|口琴|女高音|女中音|男高音|男中音)/);
        if (instMatch) instrument = instMatch[1];
      }

      await PerformancePerformer.create({
        performance_id: perf.id,
        performer_id: performer.id,
        role: instrument || '独奏',
        instrument: instrument,
      });
      added++;
      console.log(`  + ${nameZh} (${instrument || '-'}) → ${perf.title.substring(0, 45)}`);
      totalChecked++;
    }
  }

  // 统计
  const totalPP = await PerformancePerformer.count();
  const withP = await Performance.count({
    include: [{ model: PerformancePerformer, as: 'performancePerformers', required: true }],
    distinct: true,
  });

  console.log(`\n新增: ${added} | 总关联: ${totalPP} | 含演奏家演出: ${withP}`);

  // 复查 曾韵
  const zy = await Performer.findOne({ where: { name_zh: '曾韵' } });
  if (zy) {
    const pps = await PerformancePerformer.findAll({ where: { performer_id: zy.id } });
    console.log(`\n曾韵: ${pps.length} 场`);
    for (const pp of pps) {
      const p = await Performance.findByPk(pp.performance_id);
      if (p) console.log(`  - ${p.date_time.toISOString().substring(0, 10)} ${p.title.substring(0, 50)}`);
    }
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

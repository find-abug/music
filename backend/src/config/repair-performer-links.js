/**
 * 数据修复脚本 — 扫描演出文本中提到的演奏家，补全缺失的 performance_performer 关联
 *
 * 运行方式:
 *   node src/config/repair-performer-links.js          # 仅报告
 *   node src/config/repair-performer-links.js --fix    # 执行修复
 */
const sequelize = require('./database');
const { Op } = require('sequelize');
const models = require('../models/associations');
const { Performance, Performer, PerformancePerformer } = models;

async function repair(args) {
  const doFix = args.includes('--fix');

  try {
    // 确保表存在
    await sequelize.sync();

    // 1. 获取所有演奏家
    const performers = await Performer.findAll({
      attributes: ['id', 'name', 'name_zh', 'instrument'],
      order: [['id', 'ASC']],
    });
    console.log(`📋 共 ${performers.length} 位演奏家`);

    // 2. 获取所有已发布的演出
    const allPerformances = await Performance.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'subtitle', 'description', 'program_notes'],
    });
    console.log(`📋 共 ${allPerformances.length} 场已发布演出`);

    // 3. 获取所有已有的 performance_performer 关联
    const allLinks = await PerformancePerformer.findAll({
      attributes: ['performance_id', 'performer_id'],
    });
    const linkSet = new Set(allLinks.map(l => `${l.performance_id}:${l.performer_id}`));

    // 4. 扫描每个演奏家
    let totalMissing = 0;
    const newLinks = [];

    for (const performer of performers) {
      const names = [performer.name_zh, performer.name].filter(Boolean);
      if (names.length === 0) continue;

      for (const perf of allPerformances) {
        // 跳过已有链接
        if (linkSet.has(`${perf.id}:${performer.id}`)) continue;

        // 检查演出文本是否提及该演奏家
        const text = [perf.title, perf.subtitle, perf.description, perf.program_notes]
          .filter(Boolean).join(' ');

        const matched = names.some(name => text.includes(name));
        if (matched) {
          const nameDisplay = performer.name_zh || performer.name;
          const titlePreview = perf.title.length > 50 ? perf.title.slice(0, 50) + '...' : perf.title;
          console.log(`  🔗 缺失: [${nameDisplay}](${performer.instrument || ''}) → 演出#${perf.id} "${titlePreview}"`);

          newLinks.push({
            performance_id: perf.id,
            performer_id: performer.id,
            role: performer.instrument || '',
            instrument: performer.instrument || '',
          });
          totalMissing++;
        }
      }
    }

    console.log(`\n📊 共发现 ${totalMissing} 处缺失关联`);

    // 5. 执行修复
    if (doFix && newLinks.length > 0) {
      // 分批插入，每批 100 条
      const batchSize = 100;
      for (let i = 0; i < newLinks.length; i += batchSize) {
        const batch = newLinks.slice(i, i + batchSize);
        await PerformancePerformer.bulkCreate(batch);
        console.log(`  ✅ 已修复 ${batch.length} 条 (${i + 1}-${Math.min(i + batchSize, newLinks.length)})`);
      }
      console.log(`✅ 修复完成，共新增 ${newLinks.length} 条关联`);
    } else if (newLinks.length > 0) {
      console.log('\n⚠️  以上为缺失的关联，如需修复请运行:');
      console.log('   node src/config/repair-performer-links.js --fix');
    } else {
      console.log('✅ 所有演奏家关联完整，无需修复');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

repair(process.argv.slice(2));

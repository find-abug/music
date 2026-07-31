/**
 * 删除虚构数据，只保留真实来源的演出
 */
const { Performance, PerformancePiece, PerformancePerformer } = require('../models/associations');

(async () => {
  // 删除所有 source='manual' 的演出（虚构示例数据）
  const fake = await Performance.findAll({ where: { source: 'manual' } });
  console.log('删除虚构演出:');
  for (const p of fake) {
    await PerformancePiece.destroy({ where: { performance_id: p.id } });
    await PerformancePerformer.destroy({ where: { performance_id: p.id } });
    await p.destroy();
    console.log('  x', p.title.substring(0, 50));
  }

  // 把剩下的全部标为已审核
  await Performance.update(
    { source_verified: true, status: 'published' },
    { where: {} }
  );

  const total = await Performance.count();
  const withPieces = await Performance.count({
    include: [{ model: PerformancePiece, as: 'pieces', required: true }],
    distinct: true,
  });
  const withPerformers = await Performance.count({
    include: [{ model: PerformancePerformer, as: 'performancePerformers', required: true }],
    distinct: true,
  });

  console.log(`\n清理完成:`);
  console.log(`  总演出: ${total}`);
  console.log(`  含曲目: ${withPieces}`);
  console.log(`  含演奏家: ${withPerformers}`);

  process.exit(0);
})();

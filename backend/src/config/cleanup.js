/**
 * 清理低质量/乱码数据
 */
const { Performance, PerformancePiece } = require('../models/associations');

(async () => {
  // 删除ID 7-14 的低质量数据（乱码和无效日期）
  const badIds = [7, 8, 9, 10, 11, 12, 13, 14];
  for (const id of badIds) {
    try {
      await PerformancePiece.destroy({ where: { performance_id: id } });
      const p = await Performance.findByPk(id);
      if (p) {
        await p.destroy();
        console.log('Deleted #' + id + ':', (p.title || '').substring(0, 40));
      }
    } catch (e) {
      // already deleted
    }
  }

  const total = await Performance.count();
  console.log('Final clean total:', total);
  process.exit(0);
})();

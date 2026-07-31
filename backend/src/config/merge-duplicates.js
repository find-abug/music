/**
 * 合并重复实体记录
 * 问题: 不同导入脚本对 name 字段使用了不同语言，导致同一个人/场地被创建了多条记录
 * 策略: 保留英文/拼音 name 的记录，合并中文 name 的记录的关联数据，删除旧记录
 * 运行: node src/config/merge-duplicates.js
 */
const { Op } = require('sequelize');
const sequelize = require('./database');
const {
  Performance, PerformancePiece, PerformancePerformer,
  Orchestra, Venue, Composer, Conductor, Performer,
} = require('../models/associations');

// ============================================================
// 工具函数：判断是否含中文
// ============================================================
function hasChinese(str) {
  return /[一-鿿]/.test(str);
}

// ============================================================
// 通用合并函数
// ============================================================
async function mergeDuplicates(Model, fkColumns, label) {
  console.log(`\n=== 合并 ${label} 重复记录 ===`);

  const all = await Model.findAll();
  const nameZhMap = {}; // name_zh -> [{id, name}, ...]

  for (const row of all) {
    const key = row.name_zh || row.name;
    if (!nameZhMap[key]) nameZhMap[key] = [];
    nameZhMap[key].push({ id: row.id, name: row.name, name_zh: row.name_zh });
  }

  const duplicates = Object.entries(nameZhMap).filter(([, records]) => records.length > 1);

  if (duplicates.length === 0) {
    console.log('  无重复记录');
    return 0;
  }

  console.log(`  发现 ${duplicates.length} 组重复:`);

  let mergedCount = 0;
  for (const [nameZh, records] of duplicates) {
    // 优先保留英文/拼音 name（不含中文），如果都有英文则保留ID最小的
    let keep = records.find(r => !hasChinese(r.name));
    if (!keep) keep = records[0]; // 全含中文则保留第一个

    for (const dup of records) {
      if (dup.id === keep.id) continue;

      console.log(`    "${nameZh}": 保留 ID=${keep.id}(${keep.name}), 合并 ID=${dup.id}(${dup.name})`);

      // 更新所有外键引用
      for (const fk of fkColumns) {
        const [tableName, column] = fk.split('.');
        if (tableName === 'performances') {
          await Performance.update(
            { [column]: keep.id },
            { where: { [column]: dup.id } }
          );
        } else if (tableName === 'performance_performers') {
          await PerformancePerformer.update(
            { [column]: keep.id },
            { where: { [column]: dup.id } }
          );
        } else if (tableName === 'performance_pieces') {
          await PerformancePiece.update(
            { [column]: keep.id },
            { where: { [column]: dup.id } }
          );
        }
      }

      // 删除重复记录
      await Model.destroy({ where: { id: dup.id } });
      mergedCount++;
    }
  }

  console.log(`  合并了 ${mergedCount} 条重复记录`);
  return mergedCount;
}

// ============================================================
// 主导入
// ============================================================
async function main() {
  try {
    await sequelize.sync();
    console.log('✅ 数据库连接成功');

    let totalMerged = 0;

    // 1. 合并指挥家重复 (→ performances.conductor_id)
    totalMerged += await mergeDuplicates(
      Conductor,
      ['performances.conductor_id'],
      '指挥家'
    );

    // 2. 合并演奏家重复 (→ performance_performers.performer_id)
    totalMerged += await mergeDuplicates(
      Performer,
      ['performance_performers.performer_id'],
      '演奏家'
    );

    // 3. 合并场地重复 (→ performances.venue_id)
    totalMerged += await mergeDuplicates(
      Venue,
      ['performances.venue_id'],
      '场地'
    );

    // 4. 检查乐团 (← performances.orchestra_id)
    totalMerged += await mergeDuplicates(
      Orchestra,
      ['performances.orchestra_id'],
      '乐团'
    );

    // 5. 检查作曲家 (← performance_pieces.composer_id)
    totalMerged += await mergeDuplicates(
      Composer,
      ['performance_pieces.composer_id'],
      '作曲家'
    );

    console.log(`\n✅ 全部完成！共合并 ${totalMerged} 条重复记录`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 合并失败:', error);
    process.exit(1);
  }
}

main();

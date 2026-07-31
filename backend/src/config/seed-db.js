/**
 * 追加种子数据 — 不删除已有数据
 * 运行: npm run db:seed
 */
const sequelize = require('./database');
const models = require('../models/associations');
const { Performance, PerformancePiece } = models;

async function seed() {
  try {
    await sequelize.sync(); // 确保表存在（不 force）

    const now = new Date();

    const extraPerformances = [
      {
        title: '勃拉姆斯小提琴协奏曲',
        subtitle: '暨德彪西大海',
        date_time: new Date(now.getTime() + 35 * 86400000),
        venue_id: 5, orchestra_id: 3, conductor_id: 3,
        status: 'published', source: 'manual', source_verified: true,
        pieces: [
          { composer_id: 10, piece_name: 'La Mer', piece_name_zh: '大海', sort_order: 0 },
          { composer_id: 6, piece_name: 'Violin Concerto in D major, Op.77', piece_name_zh: 'D大调小提琴协奏曲', opus_number: 'Op.77', sort_order: 1 },
        ],
      },
      {
        title: '拉赫玛尼诺夫第二钢琴协奏曲',
        subtitle: '钢琴大师的浪漫之夜',
        date_time: new Date(now.getTime() + 40 * 86400000),
        venue_id: 2, orchestra_id: 2, conductor_id: 6,
        status: 'published', source: 'manual', source_verified: true,
        ticket_url: 'https://www.shsymphony.com',
        pieces: [
          { composer_id: 14, piece_name: 'Piano Concerto No.2 in C minor, Op.18', piece_name_zh: 'c小调第二钢琴协奏曲', opus_number: 'Op.18', sort_order: 0 },
          { composer_id: 12, piece_name: 'Symphony No.8 in B minor, D.759 "Unfinished"', piece_name_zh: 'b小调第八交响曲"未完成"', opus_number: 'D.759', sort_order: 1 },
        ],
      },
      {
        title: '斯特拉文斯基"春之祭"',
        subtitle: '现代音乐里程碑',
        description: '《春之祭》是斯特拉文斯基最具革命性的作品，1913年在巴黎首演时引发轰动。这部作品彻底改变了现代音乐的走向，其原始的力量和复杂的节奏至今仍令人震撼。',
        date_time: new Date(now.getTime() + 45 * 86400000),
        venue_id: 9, orchestra_id: 5,
        status: 'published', source: 'manual', source_verified: true,
        pieces: [
          { composer_id: 9, piece_name: 'The Rite of Spring', piece_name_zh: '春之祭', sort_order: 0 },
          { composer_id: 17, piece_name: 'Boléro', piece_name_zh: '波莱罗舞曲', sort_order: 1 },
        ],
      },
    ];

    let added = 0;
    for (const data of extraPerformances) {
      const { pieces, ...perfFields } = data;
      const existing = await Performance.findOne({ where: { title: data.title } });
      if (!existing) {
        const perf = await Performance.create(perfFields);
        if (pieces && pieces.length > 0) {
          await PerformancePiece.bulkCreate(pieces.map(p => ({ ...p, performance_id: perf.id })));
        }
        console.log(`  + ${data.title}`);
        added++;
      } else {
        console.log(`  ~ 已存在: ${data.title}`);
      }
    }

    console.log(`✅ 新增 ${added} 场演出`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 失败:', error);
    process.exit(1);
  }
}

seed();

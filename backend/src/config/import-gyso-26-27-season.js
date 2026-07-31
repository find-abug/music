/**
 * 贵阳交响乐团 2026-2027 第十八音乐季 — 批量导入脚本
 * 数据来源：贵交26-27乐季.docx
 * 运行: node src/config/import-gyso-26-27-season.js
 */
const sequelize = require('./database');
const {
  Performance, PerformancePiece, PerformancePerformer,
  Orchestra, Venue, Composer, Conductor, Performer,
} = require('../models/associations');

// ============================================================
// 辅助函数
// ============================================================
async function findOrCreateComposer(name, nameZh, birth, death, era) {
  const [c] = await Composer.findOrCreate({
    where: { name_zh: nameZh },
    defaults: { name, name_zh: nameZh, birth_year: birth, death_year: death, era },
  });
  return c;
}

async function findOrCreateConductor(name, nameZh, nationality) {
  const [c] = await Conductor.findOrCreate({
    where: { name_zh: nameZh },
    defaults: { name, name_zh: nameZh, nationality },
  });
  return c;
}

async function findOrCreatePerformer(name, nameZh, instrument, nationality) {
  const [p] = await Performer.findOrCreate({
    where: { name_zh: nameZh },
    defaults: { name, name_zh: nameZh, instrument, nationality },
  });
  return p;
}

async function findOrCreateOrchestra(name, nameZh, country, city) {
  const [o] = await Orchestra.findOrCreate({
    where: { name_zh: nameZh },
    defaults: { name, name_zh: nameZh, country, city },
  });
  return o;
}

async function findOrCreateVenue(name, nameZh, city) {
  const [v] = await Venue.findOrCreate({
    where: { name_zh: nameZh },
    defaults: { name, name_zh: nameZh, city },
  });
  return v;
}

// ============================================================
// 主导入
// ============================================================
async function importGYSO2627Season() {
  try {
    await sequelize.sync();
    console.log('✅ 数据库连接成功\n');

    // ========== 基础数据 ==========
    console.log('--- 准备基础数据 ---');

    const gyso = await findOrCreateOrchestra(
      'Guiyang Symphony Orchestra',
      '贵阳交响乐团',
      '中国', '贵阳'
    );
    console.log(`  乐团: ${gyso.name_zh} (ID=${gyso.id})`);

    const guiyangTheatre = await findOrCreateVenue(
      'Guiyang Grand Theatre',
      '贵阳大剧院',
      '贵阳'
    );
    console.log(`  场地: ${guiyangTheatre.name_zh} (ID=${guiyangTheatre.id})`);

    // ---- 作曲家 ----
    const composers = {};
    const compData = [
      // 已有作曲家（本乐季也会用到）
      ['Dmitri Shostakovich', '肖斯塔科维奇', 1906, 1975, 'Modern'],
      ['Sergei Rachmaninoff', '拉赫玛尼诺夫', 1873, 1943, 'Romantic'],
      ['Wolfgang Amadeus Mozart', '莫扎特', 1756, 1791, 'Classical'],
      ['Franz Schubert', '舒伯特', 1797, 1828, 'Classical'],
      ['Benjamin Britten', '布里顿', 1913, 1976, 'Modern'],
      ['Johannes Brahms', '勃拉姆斯', 1833, 1897, 'Romantic'],
      ['Gustav Mahler', '马勒', 1860, 1911, 'Romantic'],
      ['Richard Strauss', '理查·施特劳斯', 1864, 1949, 'Romantic'],
      // 新增作曲家
      ['Aram Khachaturian', '哈恰图良', 1903, 1978, 'Modern'],
      ['Otto Nicolai', '奥托·尼古拉', 1810, 1849, 'Romantic'],
      ['Franz Anton Hoffmeister', '霍夫曼斯特', 1754, 1812, 'Classical'],
      ['Carl Reinecke', '卡尔·赖内克', 1824, 1910, 'Romantic'],
      ['Anton Bruckner', '布鲁克纳', 1824, 1896, 'Romantic'],
    ];
    for (const [name, nameZh, birth, death, era] of compData) {
      composers[nameZh] = await findOrCreateComposer(name, nameZh, birth, death, era);
    }
    console.log(`  作曲家: ${Object.keys(composers).length} 位就绪`);

    // ---- 指挥家 ----
    const conductors = {};
    const condData = [
      // 已有指挥家
      ['Zhang Guoyong', '张国勇', '中国'],
      ['Yang Yang', '杨洋', '中国'],
      ['Lin Daye', '林大叶', '中国'],
      // 新增指挥家
      ['Marco Parisotto', 'Marco Parisotto', '意大利'],
      ['James Judd', 'James Judd', '英国'],
      ['Zhang Yi', '张艺', '中国'],
      ['Joseph Bastian', 'Joseph Bastian', '瑞士'],
    ];
    for (const [name, nameZh, nationality] of condData) {
      conductors[nameZh] = await findOrCreateConductor(name, nameZh, nationality);
    }
    console.log(`  指挥家: ${Object.keys(conductors).length} 位就绪`);

    // ---- 演奏家 ----
    const performers = {};
    const perfData = [
      // 已有演奏家
      ['Chen Sa', '陈萨', '钢琴', '中国'],
      ['Song Yuanming', '宋元明', '女高音', '中国'],
      // 新增演奏家
      ['Kevin Zhu', '朱凯源', '小提琴', '美国'],
      ['Wang Liya', '王丽雅', '钢琴', '中国'],
      ['Shen Yang', '沈洋', '男低音', '中国'],
      ['Liu Jian', '刘健', '钢琴', '中国'],
      ['Cai Jingwen', '蔡静雯', '女中音', '中国'],
      ['Guo Chen', '郭琛', '女高音', '中国'],
      ['Jin Zhicheng', '金智成', '圆号', '中国'],
      ['Vienna Philharmonic Principals', '维也纳爱乐声部首席', '中提琴/大提琴', '奥地利'],
      ['Xu Mengyi', '徐梦伊', '长笛', '中国'],
    ];
    for (const [name, nameZh, instrument, nationality] of perfData) {
      performers[nameZh] = await findOrCreatePerformer(name, nameZh, instrument, nationality);
    }
    console.log(`  演奏家: ${Object.keys(performers).length} 位就绪`);

    // ========== 演出数据 ==========
    console.log('\n--- 开始导入演出 ---');

    const allPerformances = [
      // ==========================================
      // 1. 开幕・肖氏回响 I
      // ==========================================
      {
        title: '开幕・肖氏回响 Ⅰ',
        description: '贵阳交响乐团2026-2027第十八音乐季开幕音乐会。张国勇执棒，携手小提琴家朱凯源，以哈恰图良与肖斯塔科维奇作品拉开新乐季帷幕。',
        date_time: '2026-08-28 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '哈恰图良', piece_name: 'Masquerade: Waltz', piece_name_zh: '《假面舞会》圆舞曲' },
          { composer: '肖斯塔科维奇', piece_name: 'Violin Concerto No.1 in A minor, Op.77', piece_name_zh: 'a小调第一小提琴协奏曲', opus_number: 'Op.77' },
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.11 in G minor "The Year 1905", Op.103', piece_name_zh: 'g小调第十一交响曲"1905年"', opus_number: 'Op.103' },
        ],
        performers_list: [{ performer: '朱凯源', role: 'soloist', instrument: '小提琴' }],
      },

      // ==========================================
      // 2. 帕格尼尼狂想・一个主题的无限可能
      // ==========================================
      {
        title: '帕格尼尼狂想・一个主题的无限可能',
        description: '意大利指挥家Marco Parisotto执棒，携手钢琴家王丽雅，演绎拉赫玛尼诺夫与肖斯塔科维奇经典。',
        date_time: '2026-09-24 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: 'Marco Parisotto',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '拉赫玛尼诺夫', piece_name: 'Rhapsody on a Theme of Paganini, Op.43', piece_name_zh: '帕格尼尼主题狂想曲', opus_number: 'Op.43' },
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.10 in E minor, Op.93', piece_name_zh: 'e小调第十交响曲', opus_number: 'Op.93' },
        ],
        performers_list: [{ performer: '王丽雅', role: 'soloist', instrument: '钢琴' }],
      },

      // ==========================================
      // 3. 肖氏回响 II・低语与轰鸣
      // ==========================================
      {
        title: '肖氏回响 Ⅱ・低语与轰鸣',
        description: '张国勇执棒，女高音宋元明与男低音沈洋联袂献唱，呈现肖斯塔科维奇两部重量级交响曲。',
        date_time: '2026-10-23 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.14 in G minor, Op.135', piece_name_zh: 'g小调第十四交响曲', opus_number: 'Op.135' },
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.4 in C minor, Op.43', piece_name_zh: 'c小调第四交响曲', opus_number: 'Op.43' },
        ],
        performers_list: [
          { performer: '宋元明', role: 'soloist', instrument: '女高音' },
          { performer: '沈洋', role: 'soloist', instrument: '男低音' },
        ],
      },

      // ==========================================
      // 4. 陈萨・纵"琴"莫扎特（两日连演）
      // ==========================================
      {
        title: '陈萨・纵"琴"莫扎特（第一日）',
        subtitle: '两日连演 · 莫扎特钢琴协奏曲',
        description: '张国勇执棒，钢琴家陈萨两日连演四首莫扎特钢琴协奏曲。第一日：降E大调第十四（K.449）与d小调第二十（K.466）。',
        date_time: '2026-11-13 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '莫扎特', piece_name: 'Piano Concerto No.14 in E-flat major, K.449', piece_name_zh: '降E大调第十四钢琴协奏曲', opus_number: 'K.449' },
          { composer: '莫扎特', piece_name: 'Piano Concerto No.20 in D minor, K.466', piece_name_zh: 'd小调第二十钢琴协奏曲', opus_number: 'K.466' },
        ],
        performers_list: [{ performer: '陈萨', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '陈萨・纵"琴"莫扎特（第二日）',
        subtitle: '两日连演 · 莫扎特钢琴协奏曲',
        description: '张国勇执棒，钢琴家陈萨两日连演四首莫扎特钢琴协奏曲。第二日：A大调第二十三（K.488）与C大调第二十五（K.503）。',
        date_time: '2026-11-14 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '莫扎特', piece_name: 'Piano Concerto No.23 in A major, K.488', piece_name_zh: 'A大调第二十三钢琴协奏曲', opus_number: 'K.488' },
          { composer: '莫扎特', piece_name: 'Piano Concerto No.25 in C major, K.503', piece_name_zh: 'C大调第二十五钢琴协奏曲', opus_number: 'K.503' },
        ],
        performers_list: [{ performer: '陈萨', role: 'soloist', instrument: '钢琴' }],
      },

      // ==========================================
      // 5. 肖氏回响 III・挚友
      // ==========================================
      {
        title: '肖氏回响 Ⅲ・挚友',
        description: '英国指挥家James Judd执棒，携手钢琴家刘健，演绎舒伯特、布里顿与肖斯塔科维奇的挚友对话。',
        date_time: '2026-12-11 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: 'James Judd',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '舒伯特', piece_name: 'Rosamunde Overture, D.644', piece_name_zh: '《罗莎蒙德》序曲', opus_number: 'D.644' },
          { composer: '布里顿', piece_name: 'Piano Concerto, Op.13', piece_name_zh: '钢琴协奏曲', opus_number: 'Op.13' },
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.6 in B minor, Op.54', piece_name_zh: 'b小调第六交响曲', opus_number: 'Op.54' },
        ],
        performers_list: [{ performer: '刘健', role: 'soloist', instrument: '钢琴' }],
      },

      // ==========================================
      // 6. 勃拉姆斯・四曲 两夜（两日连演）
      // ==========================================
      {
        title: '勃拉姆斯・四曲 两夜（第一日）',
        subtitle: '全套勃拉姆斯交响曲 · 两日连演',
        description: '张国勇执棒，两日连演全套勃拉姆斯交响曲。第一日：c小调第一交响曲（Op.68）与D大调第二交响曲（Op.73）。',
        date_time: '2027-03-12 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '勃拉姆斯', piece_name: 'Symphony No.1 in C minor, Op.68', piece_name_zh: 'c小调第一交响曲', opus_number: 'Op.68' },
          { composer: '勃拉姆斯', piece_name: 'Symphony No.2 in D major, Op.73', piece_name_zh: 'D大调第二交响曲', opus_number: 'Op.73' },
        ],
        performers_list: [],
      },
      {
        title: '勃拉姆斯・四曲 两夜（第二日）',
        subtitle: '全套勃拉姆斯交响曲 · 两日连演',
        description: '张国勇执棒，两日连演全套勃拉姆斯交响曲。第二日：F大调第三交响曲（Op.90）与e小调第四交响曲（Op.98）。',
        date_time: '2027-03-13 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '勃拉姆斯', piece_name: 'Symphony No.3 in F major, Op.90', piece_name_zh: 'F大调第三交响曲', opus_number: 'Op.90' },
          { composer: '勃拉姆斯', piece_name: 'Symphony No.4 in E minor, Op.98', piece_name_zh: 'e小调第四交响曲', opus_number: 'Op.98' },
        ],
        performers_list: [],
      },

      // ==========================================
      // 7. 马勒・正午之梦
      // ==========================================
      {
        title: '马勒・正午之梦',
        description: '杨洋执棒，女中音蔡静雯献唱，演绎马勒规模宏大的d小调第三交响曲。',
        date_time: '2027-03-26 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '杨洋',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '马勒', piece_name: 'Symphony No.3 in D minor', piece_name_zh: 'd小调第三交响曲' },
        ],
        performers_list: [{ performer: '蔡静雯', role: 'soloist', instrument: '女中音' }],
      },

      // ==========================================
      // 8. 理查・施特劳斯・一个人的史诗
      // ==========================================
      {
        title: '理查・施特劳斯・一个人的史诗',
        description: '林大叶执棒，女高音郭琛献唱，呈现理查·施特劳斯晚年杰作《最后四首歌》与交响诗《英雄的生涯》。',
        date_time: '2027-04-23 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '林大叶',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '理查·施特劳斯', piece_name: 'Vier letzte Lieder (Four Last Songs)', piece_name_zh: '最后四首歌' },
          { composer: '理查·施特劳斯', piece_name: 'Ein Heldenleben (A Hero\'s Life), Op.40', piece_name_zh: '英雄的生涯', opus_number: 'Op.40' },
        ],
        performers_list: [{ performer: '郭琛', role: 'soloist', instrument: '女高音' }],
      },

      // ==========================================
      // 9. 理查・施特劳斯・献给我亲爱的妻儿
      // ==========================================
      {
        title: '理查・施特劳斯・献给我亲爱的妻儿',
        description: '张艺执棒，携手圆号演奏家金智成，呈现理查·施特劳斯三部温情之作：第一圆号协奏曲、《变形》与《家庭交响曲》。',
        date_time: '2027-06-11 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张艺',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '理查·施特劳斯', piece_name: 'Horn Concerto No.1 in E-flat major, Op.11', piece_name_zh: '降E大调第一圆号协奏曲', opus_number: 'Op.11' },
          { composer: '理查·施特劳斯', piece_name: 'Metamorphosen, TrV 290', piece_name_zh: '《变形》', opus_number: 'TrV 290' },
          { composer: '理查·施特劳斯', piece_name: 'Symphonia Domestica, Op.53', piece_name_zh: '《家庭交响曲》', opus_number: 'Op.53' },
        ],
        performers_list: [{ performer: '金智成', role: 'soloist', instrument: '圆号' }],
      },

      // ==========================================
      // 10. GYSO 与维也纳爱乐
      // ==========================================
      {
        title: 'GYSO 与维也纳爱乐',
        description: '张国勇执棒，特邀维也纳爱乐声部首席担任中提琴与大提琴独奏，演绎尼古拉、霍夫曼斯特与理查·施特劳斯经典。',
        date_time: '2027-06-25 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '奥托·尼古拉', piece_name: 'Die lustigen Weiber von Windsor: Overture', piece_name_zh: '《温莎的风流妇人》序曲' },
          { composer: '霍夫曼斯特', piece_name: 'Viola Concerto in D major', piece_name_zh: 'D大调中提琴协奏曲' },
          { composer: '理查·施特劳斯', piece_name: 'Don Quixote, Op.35', piece_name_zh: '《唐吉诃德》', opus_number: 'Op.35' },
        ],
        performers_list: [{ performer: '维也纳爱乐声部首席', role: 'guest_principal', instrument: '中提琴/大提琴' }],
      },

      // ==========================================
      // 11. 长笛与布鲁克纳
      // ==========================================
      {
        title: '长笛与布鲁克纳',
        description: '瑞士指挥家Joseph Bastian执棒，携手长笛演奏家徐梦伊，演绎赖内克长笛协奏曲与布鲁克纳宏大第五交响曲，为本乐季收官。',
        date_time: '2027-07-16 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: 'Joseph Bastian',
        status: 'published', source: '贵交26-27乐季文档', source_url: '',
        series: '聚焦经典',
        pieces: [
          { composer: '卡尔·赖内克', piece_name: 'Flute Concerto in D major, Op.283', piece_name_zh: 'D大调长笛协奏曲', opus_number: 'Op.283' },
          { composer: '布鲁克纳', piece_name: 'Symphony No.5 in B-flat major, WAB 105', piece_name_zh: '降B大调第五交响曲', opus_number: 'WAB 105' },
        ],
        performers_list: [{ performer: '徐梦伊', role: 'soloist', instrument: '长笛' }],
      },
    ];

    // ========== 逐条插入 ==========
    let added = 0;
    let skippedExist = 0;

    for (const data of allPerformances) {
      const { pieces, performers_list, conductor_name, series, ...perfFields } = data;

      // 检查是否已存在（同标题+同日期）
      const perfDate = new Date(data.date_time);
      const existing = await Performance.findOne({
        where: { title: data.title, date_time: perfDate },
      });
      if (existing) {
        console.log(`  ~ 已存在: ${data.title} (${data.date_time})`);
        skippedExist++;
        continue;
      }

      // 处理指挥
      if (conductor_name && conductors[conductor_name]) {
        perfFields.conductor_id = conductors[conductor_name].id;
      }

      // 创建演出
      const perf = await Performance.create(perfFields);

      // 添加曲目
      if (pieces && pieces.length > 0) {
        const pieceRecords = pieces.map((p, i) => ({
          performance_id: perf.id,
          composer_id: composers[p.composer] ? composers[p.composer].id : null,
          piece_name: p.piece_name,
          piece_name_zh: p.piece_name_zh || null,
          opus_number: p.opus_number || null,
          sort_order: i,
        }));
        await PerformancePiece.bulkCreate(pieceRecords);
      }

      // 添加演奏家
      if (performers_list && performers_list.length > 0) {
        const perfPerfRecords = performers_list
          .filter(p => performers[p.performer])
          .map(p => ({
            performance_id: perf.id,
            performer_id: performers[p.performer].id,
            role: p.role || 'soloist',
            instrument: p.instrument || null,
          }));
        if (perfPerfRecords.length > 0) {
          await PerformancePerformer.bulkCreate(perfPerfRecords);
        }
      }

      console.log(`  + ${data.title} (${data.date_time})`);
      added++;
    }

    console.log(`\n✅ 导入完成: 新增 ${added} 场, 已存在跳过 ${skippedExist} 场 (共 ${allPerformances.length} 场)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

importGYSO2627Season();

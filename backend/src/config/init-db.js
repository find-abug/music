/**
 * 初始化数据库 — 创建所有表 + 插入种子数据
 * 运行: npm run db:init
 */
const sequelize = require('./database');
const path = require('path');

async function initDatabase() {
  try {
    // 导入模型（这会注册所有关联）
    const models = require('../models/associations');

    // 同步数据库（创建所有表）
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表创建成功 (SQLite)');
    console.log('   数据文件: ' + path.resolve(sequelize.options.storage));

    // ============ 插入种子数据 ============
    await seedData(models);
    console.log('✅ 种子数据插入完成');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

async function seedData(models) {
  const { Composer, Conductor, Performer, Orchestra, Venue, Performance, PerformancePiece, PerformancePerformer } = models;

  // ---- 作曲家 ----
  const composers = await Composer.bulkCreate([
    { name: 'Ludwig van Beethoven', name_zh: '贝多芬', birth_year: 1770, death_year: 1827, era: 'Classical' },
    { name: 'Wolfgang Amadeus Mozart', name_zh: '莫扎特', birth_year: 1756, death_year: 1791, era: 'Classical' },
    { name: 'Johann Sebastian Bach', name_zh: '巴赫', birth_year: 1685, death_year: 1750, era: 'Baroque' },
    { name: 'Pyotr Ilyich Tchaikovsky', name_zh: '柴可夫斯基', birth_year: 1840, death_year: 1893, era: 'Romantic' },
    { name: 'Frédéric Chopin', name_zh: '肖邦', birth_year: 1810, death_year: 1849, era: 'Romantic' },
    { name: 'Johannes Brahms', name_zh: '勃拉姆斯', birth_year: 1833, death_year: 1897, era: 'Romantic' },
    { name: 'Gustav Mahler', name_zh: '马勒', birth_year: 1860, death_year: 1911, era: 'Romantic' },
    { name: 'Dmitri Shostakovich', name_zh: '肖斯塔科维奇', birth_year: 1906, death_year: 1975, era: 'Modern' },
    { name: 'Igor Stravinsky', name_zh: '斯特拉文斯基', birth_year: 1882, death_year: 1971, era: 'Modern' },
    { name: 'Claude Debussy', name_zh: '德彪西', birth_year: 1862, death_year: 1918, era: 'Modern' },
    { name: 'Antonín Dvořák', name_zh: '德沃夏克', birth_year: 1841, death_year: 1904, era: 'Romantic' },
    { name: 'Franz Schubert', name_zh: '舒伯特', birth_year: 1797, death_year: 1828, era: 'Classical' },
    { name: 'Joseph Haydn', name_zh: '海顿', birth_year: 1732, death_year: 1809, era: 'Classical' },
    { name: 'Sergei Rachmaninoff', name_zh: '拉赫玛尼诺夫', birth_year: 1873, death_year: 1943, era: 'Romantic' },
    { name: 'Richard Strauss', name_zh: '理查·施特劳斯', birth_year: 1864, death_year: 1949, era: 'Romantic' },
    { name: 'Jean Sibelius', name_zh: '西贝柳斯', birth_year: 1865, death_year: 1957, era: 'Romantic' },
    { name: 'Maurice Ravel', name_zh: '拉威尔', birth_year: 1875, death_year: 1937, era: 'Modern' },
    { name: 'Sergei Prokofiev', name_zh: '普罗科菲耶夫', birth_year: 1891, death_year: 1953, era: 'Modern' },
    { name: 'Edward Elgar', name_zh: '埃尔加', birth_year: 1857, death_year: 1934, era: 'Romantic' },
    { name: 'Benjamin Britten', name_zh: '布里顿', birth_year: 1913, death_year: 1976, era: 'Modern' },
  ]);
  console.log(`  ✓ ${composers.length} 位作曲家`);

  // ---- 指挥家 ----
  const conductors = await Conductor.bulkCreate([
    { name: 'Yu Long', name_zh: '余隆', nationality: '中国' },
    { name: 'Zhang Yi', name_zh: '张艺', nationality: '中国' },
    { name: 'Lü Jia', name_zh: '吕嘉', nationality: '中国' },
    { name: 'Herbert von Karajan', name_zh: '卡拉扬', nationality: '奥地利' },
    { name: 'Leonard Bernstein', name_zh: '伯恩斯坦', nationality: '美国' },
    { name: 'Riccardo Muti', name_zh: '穆蒂', nationality: '意大利' },
    { name: 'Simon Rattle', name_zh: '西蒙·拉特', nationality: '英国' },
    { name: 'Gustavo Dudamel', name_zh: '杜达梅尔', nationality: '委内瑞拉' },
    { name: 'Yannick Nézet-Séguin', name_zh: '雅尼克', nationality: '加拿大' },
    { name: 'Tan Dun', name_zh: '谭盾', nationality: '中国' },
  ]);
  console.log(`  ✓ ${conductors.length} 位指挥家`);

  // ---- 演奏家 ----
  const performers = await Performer.bulkCreate([
    { name: 'Lang Lang', name_zh: '郎朗', instrument: '钢琴', nationality: '中国' },
    { name: 'Yuja Wang', name_zh: '王羽佳', instrument: '钢琴', nationality: '中国' },
    { name: 'Yo-Yo Ma', name_zh: '马友友', instrument: '大提琴', nationality: '美国' },
    { name: 'Anne-Sophie Mutter', name_zh: '穆特', instrument: '小提琴', nationality: '德国' },
    { name: 'Yunchan Lim', name_zh: '林允灿', instrument: '钢琴', nationality: '韩国' },
    { name: 'Hilary Hahn', name_zh: '希拉里·哈恩', instrument: '小提琴', nationality: '美国' },
    { name: 'Li Yundi', name_zh: '李云迪', instrument: '钢琴', nationality: '中国' },
    { name: 'Ning Feng', name_zh: '宁峰', instrument: '小提琴', nationality: '中国' },
    { name: 'Wang Jian', name_zh: '王健', instrument: '大提琴', nationality: '中国' },
    { name: 'Martha Argerich', name_zh: '阿格里奇', instrument: '钢琴', nationality: '阿根廷' },
  ]);
  console.log(`  ✓ ${performers.length} 位演奏家`);

  // ---- 乐团 ----
  const orchestras = await Orchestra.bulkCreate([
    { name: 'China Philharmonic Orchestra', name_zh: '中国爱乐乐团', country: '中国', city: '北京' },
    { name: 'Shanghai Symphony Orchestra', name_zh: '上海交响乐团', country: '中国', city: '上海' },
    { name: 'China National Symphony Orchestra', name_zh: '中国国家交响乐团', country: '中国', city: '北京' },
    { name: 'Guangzhou Symphony Orchestra', name_zh: '广州交响乐团', country: '中国', city: '广州' },
    { name: 'Shenzhen Symphony Orchestra', name_zh: '深圳交响乐团', country: '中国', city: '深圳' },
    { name: 'Berlin Philharmonic', name_zh: '柏林爱乐乐团', country: '德国', city: '柏林' },
    { name: 'Vienna Philharmonic', name_zh: '维也纳爱乐乐团', country: '奥地利', city: '维也纳' },
    { name: 'Royal Concertgebouw Orchestra', name_zh: '皇家音乐厅管弦乐团', country: '荷兰', city: '阿姆斯特丹' },
    { name: 'London Symphony Orchestra', name_zh: '伦敦交响乐团', country: '英国', city: '伦敦' },
    { name: 'New York Philharmonic', name_zh: '纽约爱乐乐团', country: '美国', city: '纽约' },
  ]);
  console.log(`  ✓ ${orchestras.length} 个乐团`);

  // ---- 演出场所 ----
  const venues = await Venue.bulkCreate([
    { name: 'National Centre for the Performing Arts', name_zh: '国家大剧院', city: '北京', district: '西城区', address: '西城区西长安街2号' },
    { name: 'Shanghai Symphony Hall', name_zh: '上海交响乐团音乐厅', city: '上海', district: '徐汇区', address: '复兴中路1380号' },
    { name: 'Shanghai Oriental Art Center', name_zh: '上海东方艺术中心', city: '上海', district: '浦东新区', address: '丁香路425号' },
    { name: 'Xinghai Concert Hall', name_zh: '星海音乐厅', city: '广州', district: '越秀区', address: '二沙岛晴波路33号' },
    { name: 'Beijing Concert Hall', name_zh: '北京音乐厅', city: '北京', district: '西城区', address: '北新华街1号' },
    { name: 'Forbidden City Concert Hall', name_zh: '中山公园音乐堂', city: '北京', district: '东城区', address: '中山公园内' },
    { name: 'Shanghai Grand Theatre', name_zh: '上海大剧院', city: '上海', district: '黄浦区', address: '人民大道300号' },
    { name: 'Jiangsu Centre for the Performing Arts', name_zh: '江苏大剧院', city: '南京', district: '建邺区', address: '梦都大街181号' },
    { name: 'Shenzhen Concert Hall', name_zh: '深圳音乐厅', city: '深圳', district: '福田区', address: '福中一路2016号' },
    { name: 'Wuhan Qintai Concert Hall', name_zh: '武汉琴台音乐厅', city: '武汉', district: '汉阳区', address: '琴台大道10号' },
    { name: 'Xi\'an Concert Hall', name_zh: '西安音乐厅', city: '西安', district: '雁塔区', address: '雁南一路' },
    { name: 'Chengdu City Concert Hall', name_zh: '成都城市音乐厅', city: '成都', district: '武侯区', address: '一环路南一段' },
    { name: 'Hangzhou Grand Theatre', name_zh: '杭州大剧院', city: '杭州', district: '上城区', address: '新业路39号' },
    { name: 'Tianjin Grand Theatre', name_zh: '天津大剧院', city: '天津', district: '河西区', address: '平江道58号' },
  ]);
  console.log(`  ✓ ${venues.length} 个演出场所`);

  // ---- 示例演出数据 ----
  const now = new Date();
  const perfData = [
    {
      title: '贝多芬交响曲全集系列音乐会（一）',
      subtitle: '命运交响曲与田园交响曲',
      description: '本场音乐会将演奏贝多芬最著名的两部交响曲——第五交响曲"命运"和第六交响曲"田园"。由中国爱乐乐团倾情演绎，带您感受贝多芬音乐中澎湃的力量与深邃的情感。',
      date_time: new Date(now.getTime() + 10 * 86400000), // 10天后
      end_time: new Date(now.getTime() + 10 * 86400000 + 2 * 3600000),
      venue_id: 1, orchestra_id: 1, conductor_id: 1,
      status: 'published', source: 'manual', source_verified: true,
      pieces: [
        { composer_id: 1, piece_name: 'Symphony No.5 in C minor, Op.67', piece_name_zh: 'c小调第五交响曲"命运"', opus_number: 'Op.67', sort_order: 0 },
        { composer_id: 1, piece_name: 'Symphony No.6 in F major, Op.68', piece_name_zh: 'F大调第六交响曲"田园"', opus_number: 'Op.68', sort_order: 1 },
      ],
    },
    {
      title: '莫扎特之夜 — 钢琴协奏曲专场',
      subtitle: '纪念莫扎特诞辰270周年',
      description: '为纪念莫扎特诞辰270周年，上海交响乐团将带来莫扎特最经典的钢琴协奏曲作品。特邀钢琴家郎朗担任独奏，演绎莫扎特最受欢迎的钢琴协奏曲。',
      date_time: new Date(now.getTime() + 14 * 86400000),
      end_time: new Date(now.getTime() + 14 * 86400000 + 2.5 * 3600000),
      venue_id: 2, orchestra_id: 2, conductor_id: 1,
      status: 'published', source: 'manual', source_verified: true,
      ticket_url: 'https://www.shsymphony.com',
      pieces: [
        { composer_id: 2, piece_name: 'Piano Concerto No.21 in C major, K.467', piece_name_zh: 'C大调第21钢琴协奏曲', opus_number: 'K.467', sort_order: 0 },
        { composer_id: 2, piece_name: 'Piano Concerto No.23 in A major, K.488', piece_name_zh: 'A大调第23钢琴协奏曲', opus_number: 'K.488', sort_order: 1 },
        { composer_id: 2, piece_name: 'Symphony No.41 in C major, K.551 "Jupiter"', piece_name_zh: 'C大调第41交响曲"朱庇特"', opus_number: 'K.551', sort_order: 2 },
      ],
    },
    {
      title: '柴可夫斯基经典作品音乐会',
      subtitle: '天鹅湖·胡桃夹子·1812序曲',
      description: '一场跨越芭蕾与交响的柴可夫斯基音乐盛宴。从《天鹅湖》的优雅到《1812序曲》的磅礴，带您领略俄罗斯音乐的灵魂。',
      date_time: new Date(now.getTime() + 18 * 86400000 + 20 * 3600000),
      venue_id: 3, orchestra_id: 2, conductor_id: 6,
      status: 'published', source: 'manual', source_verified: true,
      ticket_url: 'https://www.shoac.com.cn',
      pieces: [
        { composer_id: 4, piece_name: 'Swan Lake Suite, Op.20a', piece_name_zh: '天鹅湖组曲', opus_number: 'Op.20a', sort_order: 0 },
        { composer_id: 4, piece_name: 'The Nutcracker Suite, Op.71a', piece_name_zh: '胡桃夹子组曲', opus_number: 'Op.71a', sort_order: 1 },
        { composer_id: 4, piece_name: '1812 Overture, Op.49', piece_name_zh: '1812序曲', opus_number: 'Op.49', sort_order: 2 },
      ],
    },
    {
      title: '巴赫无伴奏大提琴组曲全集',
      subtitle: '跨越时空的对话',
      date_time: new Date(now.getTime() + 22 * 86400000),
      venue_id: 4,
      status: 'published', source: 'manual', source_verified: true,
      ticket_url: 'https://www.concerthall.com.cn',
      pieces: [
        { composer_id: 3, piece_name: 'Cello Suite No.1 in G major, BWV 1007', piece_name_zh: 'G大调第一无伴奏大提琴组曲', opus_number: 'BWV 1007', sort_order: 0 },
        { composer_id: 3, piece_name: 'Cello Suite No.3 in C major, BWV 1009', piece_name_zh: 'C大调第三无伴奏大提琴组曲', opus_number: 'BWV 1009', sort_order: 1 },
        { composer_id: 3, piece_name: 'Cello Suite No.5 in C minor, BWV 1011', piece_name_zh: 'c小调第五无伴奏大提琴组曲', opus_number: 'BWV 1011', sort_order: 2 },
      ],
    },
    {
      title: '德沃夏克第九交响曲"自新大陆"',
      subtitle: '暨肖邦第一钢琴协奏曲',
      date_time: new Date(now.getTime() + 25 * 86400000),
      venue_id: 1, orchestra_id: 3, conductor_id: 3,
      status: 'published', source: 'manual', source_verified: true,
      pieces: [
        { composer_id: 5, piece_name: 'Piano Concerto No.1 in E minor, Op.11', piece_name_zh: 'e小调第一钢琴协奏曲', opus_number: 'Op.11', sort_order: 0 },
        { composer_id: 11, piece_name: 'Symphony No.9 in E minor, Op.95 "From the New World"', piece_name_zh: 'e小调第九交响曲"自新大陆"', opus_number: 'Op.95', sort_order: 1 },
      ],
    },
    {
      title: '马勒第三交响曲',
      subtitle: '广州交响乐团2026乐季',
      description: '马勒的第三交响曲是史上最长的交响曲之一，共六个乐章。作品描绘了自然界从无生命到神圣之爱的进化过程，是交响乐史上最具野心的作品之一。',
      date_time: new Date(now.getTime() + 30 * 86400000),
      venue_id: 4, orchestra_id: 4, conductor_id: 1,
      status: 'published', source: 'manual', source_verified: true,
      pieces: [
        { composer_id: 7, piece_name: 'Symphony No.3 in D minor', piece_name_zh: 'd小调第三交响曲', sort_order: 0 },
      ],
    },
  ];

  for (const data of perfData) {
    const { pieces, ...perfFields } = data;
    const perf = await Performance.create(perfFields);
    if (pieces && pieces.length > 0) {
      await PerformancePiece.bulkCreate(pieces.map(p => ({ ...p, performance_id: perf.id })));
    }
  }
  console.log(`  ✓ ${perfData.length} 场示例演出`);
  console.log('');
  console.log('📅 示例演出日期:');
  perfData.forEach(p => {
    const d = new Date(p.date_time);
    console.log(`  ${d.getMonth()+1}/${d.getDate()} — ${p.title}`);
  });
}

initDatabase();

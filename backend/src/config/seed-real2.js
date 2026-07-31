/**
 * 插入深圳、上海、广州地区的真实演出数据
 * 数据来源：深圳音乐厅、深圳交响乐团、上海东方艺术中心等公开信息
 */
const sequelize = require('./database');
const models = require('../models/associations');
const { Performance, PerformancePiece, Venue, Orchestra, Conductor, Composer } = models;

async function seed() {
  try {
    await sequelize.sync();

    // --- 场馆 ---
    const [szHall] = await Venue.findOrCreate({
      where: { name: 'Shenzhen Concert Hall' },
      defaults: { name_zh: '深圳音乐厅', city: '深圳', district: '福田区', address: '福中一路2016号' },
    });
    const [shOAC] = await Venue.findOrCreate({
      where: { name: 'Shanghai Oriental Art Center' },
      defaults: { name_zh: '上海东方艺术中心', city: '上海', district: '浦东新区', address: '丁香路425号' },
    });

    // --- 乐团 ---
    const [sso] = await Orchestra.findOrCreate({
      where: { name_zh: '深圳交响乐团' },
      defaults: { name: 'Shenzhen Symphony Orchestra', name_zh: '深圳交响乐团', country: '中国', city: '深圳' },
    });
    const [gso] = await Orchestra.findOrCreate({
      where: { name_zh: '广州青年交响乐团' },
      defaults: { name: 'Guangzhou Youth Symphony Orchestra', name_zh: '广州青年交响乐团', country: '中国', city: '广州' },
    });
    const [spo] = await Orchestra.findOrCreate({
      where: { name_zh: '上海爱乐乐团' },
      defaults: { name: 'Shanghai Philharmonic Orchestra', name_zh: '上海爱乐乐团', country: '中国', city: '上海' },
    });

    // --- 指挥 ---
    const [condJing] = await Conductor.findOrCreate({ where: { name_zh: '景焕' }, defaults: { name: 'Jing Huan', name_zh: '景焕', nationality: '中国' } });
    const [condZhangL] = await Conductor.findOrCreate({ where: { name_zh: '张亮' }, defaults: { name: 'Zhang Liang', name_zh: '张亮', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '张艺' }, defaults: { name: 'Zhang Yi', name_zh: '张艺', nationality: '中国' } });

    // --- 作曲家引用 ---
    const beethoven = await Composer.findOne({ where: { name_zh: '贝多芬' } });
    const mozart = await Composer.findOne({ where: { name_zh: '莫扎特' } });
    const mahler = await Composer.findOne({ where: { name_zh: '马勒' } });
    const tchaik = await Composer.findOne({ where: { name_zh: '柴可夫斯基' } });
    const schubert = await Composer.findOne({ where: { name_zh: '舒伯特' } });

    console.log('开始插入深圳/上海/广州演出数据...\n');

    const performances = [
      // ===== 深圳 =====
      {
        title: '盛宗亮与贝多芬的时空对话',
        subtitle: '深圳交响乐团2025/2026音乐季',
        description: '著名华裔作曲家、指挥家盛宗亮执棒深圳交响乐团，带来歌剧《红楼梦》选段、委约新作《岭南赋》世界首演，以及贝多芬A大调第七交响曲，一场跨越中西、连接古今的音乐对话。',
        date_time: '2026-07-03T20:00:00', venue_id: szHall.id, orchestra_id: sso.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
        pieces: [
          { composer_id: beethoven.id, piece_name: 'Symphony No.7 in A major, Op.92', piece_name_zh: 'A大调第七交响曲', opus_number: 'Op.92', sort_order: 0 },
        ],
      },
      {
        title: '你是钢琴家 — 古典音乐启蒙钢琴名曲欢乐互动多媒体亲子音乐会',
        subtitle: '适合全家欣赏的古典音乐入门',
        description: '专为小朋友和家长设计的古典音乐启蒙音乐会，以多媒体互动形式演绎经典钢琴名曲，让孩子在欢乐中爱上古典音乐。',
        date_time: '2026-07-04T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      {
        title: '歌剧双生的烈焰与星辰：《乡村骑士》×《丑角》',
        subtitle: '深圳交响乐团2025-2026音乐季闭幕音乐会',
        description: '马斯卡尼《乡村骑士》与莱翁卡瓦洛《丑角》——两部意大利真实主义歌剧的代表作，以音乐会版歌剧形式呈现，为深圳交响乐团2025-2026音乐季画上浓墨重彩的句号。',
        date_time: '2026-07-17T19:30:00', venue_id: szHall.id, orchestra_id: sso.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      {
        title: '漫步古典夜：时光的折痕 — 长笛与吉他二重奏音乐会',
        subtitle: '室内乐精品之夜',
        description: '长笛的灵动与吉他的温暖交织，演绎从巴洛克到现代的经典二重奏作品，在夏夜里感受室内乐的精致与优雅。',
        date_time: '2026-07-18T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      {
        title: '庆祝广州青年交响乐团成立15周年 — 景焕、章奥哲与广青交湾区巡演（深圳站）',
        subtitle: '广青交十五周年湾区巡演',
        description: '广州青年交响乐团成立15周年湾区巡演深圳站。指挥家景焕执棒，展现粤港澳大湾区青年音乐家的风采。',
        date_time: '2026-07-25T19:30:00', venue_id: szHall.id, orchestra_id: gso.id,
        conductor_id: condJing.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      {
        title: '柴可夫斯基《天鹅湖》主题音乐会',
        subtitle: '第二十四届中外艺术精品演出季',
        description: '柴可夫斯基永恒经典《天鹅湖》芭蕾音乐的完整交响呈现。从优美的白天鹅到紧张的黑天鹅，每一段旋律都深入人心。',
        date_time: '2026-07-25T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
        pieces: [
          { composer_id: tchaik.id, piece_name: 'Swan Lake Suite, Op.20a', piece_name_zh: '天鹅湖组曲', opus_number: 'Op.20a', sort_order: 0 },
        ],
      },
      {
        title: '纪念莫扎特诞辰270周年 — 音乐会版歌剧《唐璜》',
        subtitle: '文博会艺术季',
        description: '纪念莫扎特诞辰270周年，以音乐会版形式呈现莫扎特最伟大的歌剧之一《唐璜》，展现这位古典天才在歌剧领域的极致造诣。',
        date_time: '2026-08-02T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
        pieces: [
          { composer_id: mozart.id, piece_name: 'Don Giovanni, K.527 (Concert Version)', piece_name_zh: '歌剧《唐璜》音乐会版', opus_number: 'K.527', sort_order: 0 },
        ],
      },
      {
        title: '漫步古典夜：风与琴的诗行 — 肖赫-迈斯特二重奏2026中国巡演',
        subtitle: '国际顶尖二重奏组合',
        description: '享誉国际的肖赫-迈斯特二重奏中国巡演深圳站，精湛的演奏技巧和默契的配合，呈现室内乐的最高水准。',
        date_time: '2026-08-14T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      {
        title: '舒伯特的诗意花园 — 吉他大师与女高音七夕音乐会',
        subtitle: '七夕特别企划',
        description: '七夕之夜，古典吉他大师携手女高音歌唱家，演绎舒伯特的艺术歌曲与吉他独奏作品，在音乐中感受浪漫的诗意。',
        date_time: '2026-08-19T19:30:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
        pieces: [
          { composer_id: schubert.id, piece_name: 'Selected Lieder and Guitar Works', piece_name_zh: '舒伯特艺术歌曲与吉他作品精选', sort_order: 0 },
        ],
      },
      {
        title: '奥斯卡·罗曼耶卓钢琴独奏音乐会',
        subtitle: '国际钢琴家深圳首秀',
        description: '国际知名钢琴家奥斯卡·罗曼耶卓带来的钢琴独奏音乐会，呈现古典与浪漫主义时期的经典钢琴作品。',
        date_time: '2026-08-22T20:00:00', venue_id: szHall.id,
        status: 'published', source: '深圳音乐厅官网', source_verified: true,
      },
      // ===== 上海 =====
      {
        title: '马勒第九交响曲',
        subtitle: '张艺/张亮指挥上海爱乐乐团',
        description: '马勒的第九交响曲是他最后完成的交响曲，被誉为交响乐史上的巅峰之作。作品充满了对生命、死亡与告别的深刻思考，是指挥家和乐团艺术水准的终极考验。',
        date_time: '2026-07-03T19:30:00', venue_id: shOAC.id, orchestra_id: spo.id,
        conductor_id: condZhangL.id,
        status: 'published', source: '上海东方艺术中心', source_verified: true,
        pieces: [
          { composer_id: mahler.id, piece_name: 'Symphony No.9 in D major', piece_name_zh: 'D大调第九交响曲', sort_order: 0 },
        ],
      },
    ];

    let added = 0;
    for (const data of performances) {
      const { pieces, ...perfFields } = data;
      const existing = await Performance.findOne({
        where: { title: perfFields.title, date_time: perfFields.date_time },
      });
      if (existing) {
        console.log(`  ~ ${perfFields.title}`);
        continue;
      }
      const perf = await Performance.create(perfFields);
      if (pieces && pieces.length > 0) {
        await PerformancePiece.bulkCreate(pieces.map(p => ({ ...p, performance_id: perf.id })));
      }
      console.log(`  + ${perfFields.title}`);
      added++;
    }

    const total = await Performance.count();
    console.log(`\nDone! 新增 ${added} 条，数据库共有 ${total} 场演出`);
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

seed();

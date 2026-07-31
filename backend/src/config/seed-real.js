/**
 * 插入真实演出数据 — 从公开渠道收集的 2026 年演出信息
 * 运行: node src/config/seed-real.js
 */
const sequelize = require('./database');
const models = require('../models/associations');
const { Performance, PerformancePiece, Composer, Venue, Orchestra, Conductor, Performer } = models;

async function seedReal() {
  try {
    await sequelize.sync();

    // 确保有基础场馆（国家大剧院的子场馆）
    const [venueNCPA] = await Venue.findOrCreate({
      where: { name: 'National Centre for the Performing Arts' },
      defaults: { name_zh: '国家大剧院·音乐厅', city: '北京', district: '西城区', address: '西城区西长安街2号' },
    });
    const [venueBJArt] = await Venue.findOrCreate({
      where: { name: 'Beijing Art Centre Concert Hall' },
      defaults: { name_zh: '北京艺术中心·音乐厅', city: '北京', district: '通州区' },
    });
    const [venueTaihu] = await Venue.findOrCreate({
      where: { name: 'Taihu Theatre' },
      defaults: { name_zh: '台湖剧场', city: '北京', district: '通州区' },
    });
    const [venueOpera] = await Venue.findOrCreate({
      where: { name: 'NCPA Opera House' },
      defaults: { name_zh: '国家大剧院·歌剧院', city: '北京', district: '西城区' },
    });

    // 确保乐团
    const [ncpao] = await Orchestra.findOrCreate({
      where: { name: 'NCPA Orchestra' },
      defaults: { name_zh: '国家大剧院管弦乐团', country: '中国', city: '北京' },
    });
    const [cnso] = await Orchestra.findOrCreate({
      where: { name: 'China National Symphony Orchestra' },
      defaults: { name_zh: '中国交响乐团', country: '中国', city: '北京' },
    });
    const [bso] = await Orchestra.findOrCreate({
      where: { name_zh: '北京交响乐团' },
      defaults: { name: 'Beijing Symphony Orchestra', name_zh: '北京交响乐团', country: '中国', city: '北京' },
    });
    const [cballet] = await Orchestra.findOrCreate({
      where: { name_zh: '中央芭蕾舞团交响乐团' },
      defaults: { name: 'National Ballet of China Symphony Orchestra', name_zh: '中央芭蕾舞团交响乐团', country: '中国', city: '北京' },
    });
    const [ccm] = await Orchestra.findOrCreate({
      where: { name_zh: '中央歌剧院' },
      defaults: { name: 'China National Opera House', name_zh: '中央歌剧院', country: '中国', city: '北京' },
    });
    const [chinaFilm] = await Orchestra.findOrCreate({
      where: { name_zh: '中国电影乐团' },
      defaults: { name: 'China Film Symphony Orchestra', name_zh: '中国电影乐团', country: '中国', city: '北京' },
    });
    const [venezuela] = await Orchestra.findOrCreate({
      where: { name_zh: '委内瑞拉胡安·何塞·兰达埃塔交响乐团' },
      defaults: { name: 'Juan Jose Landaeta Symphony Orchestra', name_zh: '委内瑞拉胡安·何塞·兰达埃塔交响乐团', country: '委内瑞拉', city: '加拉加斯' },
    });
    const [berlin12] = await Orchestra.findOrCreate({
      where: { name_zh: '柏林爱乐十二把大提琴' },
      defaults: { name: 'Die 12 Cellisten der Berliner Philharmoniker', name_zh: '柏林爱乐十二把大提琴', country: '德国', city: '柏林' },
    });

    // 确保指挥
    const [, created] = await Conductor.findOrCreate({ where: { name_zh: '黄佳俊' }, defaults: { name: 'Kahchun Wong', name_zh: '黄佳俊', nationality: '新加坡' } });
    await Conductor.findOrCreate({ where: { name_zh: '张艺' }, defaults: { name: 'Zhang Yi', name_zh: '张艺', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '余隆' }, defaults: { name: 'Yu Long', name_zh: '余隆', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '戴维·霍斯' }, defaults: { name: 'David Hoose', name_zh: '戴维·霍斯', nationality: '美国' } });
    await Conductor.findOrCreate({ where: { name_zh: '金野' }, defaults: { name: 'Jin Ye', name_zh: '金野', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '杨洋' }, defaults: { name: 'Yang Yang', name_zh: '杨洋', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '俞峰' }, defaults: { name: 'Yu Feng', name_zh: '俞峰', nationality: '中国' } });
    await Conductor.findOrCreate({ where: { name_zh: '沈凡秀' }, defaults: { name: 'Shen Fanxiu', name_zh: '沈凡秀', nationality: '中国' } });

    // 演奏家
    await Performer.findOrCreate({ where: { name_zh: '吴巍' }, defaults: { name: 'Wu Wei', name_zh: '吴巍', instrument: '笙', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '万捷旎' }, defaults: { name: 'Wan Jieni', name_zh: '万捷旎', instrument: '钢琴', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '曾韵' }, defaults: { name: 'Zeng Yun', name_zh: '曾韵', instrument: '圆号', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '黎雨荷' }, defaults: { name: 'Li Yuhe', name_zh: '黎雨荷', instrument: '小提琴', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '鞠小夫' }, defaults: { name: 'Ju Xiaofu', name_zh: '鞠小夫', instrument: '钢琴', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '李晶晶' }, defaults: { name: 'Li Jingjing', name_zh: '李晶晶', instrument: '声乐', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '宋思衡' }, defaults: { name: 'Song Siheng', name_zh: '宋思衡', instrument: '钢琴', nationality: '中国' } });
    await Performer.findOrCreate({ where: { name_zh: '刘浩' }, defaults: { name: 'Liu Hao', name_zh: '刘浩', instrument: '钢琴', nationality: '中国' } });

    // 确保作曲家存在
    const findComposer = async (nameZh, defaults) => {
      const [c] = await Composer.findOrCreate({ where: { name_zh: nameZh }, defaults });
      return c;
    };
    const beethoven = await Composer.findOne({ where: { name_zh: '贝多芬' } });
    const mozart = await Composer.findOne({ where: { name_zh: '莫扎特' } });
    const bach = await Composer.findOne({ where: { name_zh: '巴赫' } });
    const mahler = await Composer.findOne({ where: { name_zh: '马勒' } });
    const shosta = await Composer.findOne({ where: { name_zh: '肖斯塔科维奇' } });
    const rach = await Composer.findOne({ where: { name_zh: '拉赫玛尼诺夫' } });
    const tchaik = await Composer.findOne({ where: { name_zh: '柴可夫斯基' } });
    const weber = await findComposer('韦伯', { name: 'Carl Maria von Weber', name_zh: '韦伯', birth_year: 1786, death_year: 1826, era: 'Classical' });
    const piazzolla = await findComposer('皮亚佐拉', { name: 'Astor Piazzolla', name_zh: '皮亚佐拉', birth_year: 1921, death_year: 1992, era: 'Modern' });
    const vivaldi = await findComposer('维瓦尔第', { name: 'Antonio Vivaldi', name_zh: '维瓦尔第', birth_year: 1678, death_year: 1741, era: 'Baroque' });

    console.log('基础数据就绪，开始插入真实演出...\n');

    // ==========================================
    // 2026年7月 国家大剧院"漫步经典"系列
    // 数据来源：北京青年报、国家大剧院官网
    // ==========================================

    const performances = [
      {
        title: '台湖星期音乐会·《来自地球的钢琴诗》',
        subtitle: '宋思衡多媒体钢琴音乐会',
        description: '钢琴家宋思衡以多媒体形式呈现的独特钢琴音乐会，将视觉艺术与音乐完美融合。',
        date_time: '2026-07-04T19:30:00',
        venue_id: venueTaihu.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
      },
      {
        title: '"韵声激荡·薪火相传"音乐会',
        subtitle: '中央歌剧院专场',
        description: '中央歌剧院献演的经典作品音乐会，展现中国声乐艺术的传承与创新。',
        date_time: '2026-07-05T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: ccm.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
      },
      {
        title: '漫步经典开幕：柏林爱乐十二把大提琴',
        subtitle: '第十七届"漫步经典"系列开幕音乐会',
        description: '享誉全球的柏林爱乐十二把大提琴室内乐团，三度获德国回声古典音乐大奖。十二位大提琴家以精湛的技艺和独特的编曲，演绎从古典到现代的丰富曲目，呈现大提琴合奏的极致魅力。',
        date_time: '2026-07-08T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: berlin12.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        ticket_url: 'https://www.chncpa.org',
      },
      {
        title: '漫步经典：演绎贝多芬与蒂恩苏',
        subtitle: '黄佳俊、吴巍与国家大剧院管弦乐团',
        description: '新加坡指挥家黄佳俊执棒，笙演奏家吴巍、管风琴家索菲娅·格雷戈里联袂献演。曲目包括贝多芬A大调第七交响曲及委约新作《笙与管风琴协奏曲》。',
        date_time: '2026-07-10T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: ncpao.id, conductor_id: (await Conductor.findOne({ where: { name_zh: '黄佳俊' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: null, piece_name: 'Concerto for Sheng and Organ', piece_name_zh: '笙与管风琴协奏曲（委约新作）', sort_order: 0 },
          { composer_id: beethoven.id, piece_name: 'Symphony No.7 in A major, Op.92', piece_name_zh: 'A大调第七交响曲', opus_number: 'Op.92', sort_order: 1 },
        ],
      },
      {
        title: '纪念肖斯塔科维奇诞辰120周年',
        subtitle: '张艺、万捷旎与中央芭蕾舞团交响乐团',
        description: '纪念20世纪最伟大的作曲家之一肖斯塔科维奇诞辰120周年。指挥家张艺携手钢琴家万捷旎，演绎肖斯塔科维奇经典作品。',
        date_time: '2026-07-17T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: cballet.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '张艺' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        ticket_url: 'https://www.piaoniu.com/activity/778663',
        pieces: [
          { composer_id: shosta.id, piece_name: 'Jazz Suite No.2', piece_name_zh: '第二爵士组曲', sort_order: 0 },
          { composer_id: shosta.id, piece_name: 'Piano Concerto No.2 in F major, Op.102', piece_name_zh: 'F大调第二钢琴协奏曲', opus_number: 'Op.102', sort_order: 1 },
          { composer_id: shosta.id, piece_name: 'Hamlet Suite, Op.116a', piece_name_zh: '《哈姆雷特》配乐组曲', opus_number: 'Op.116a', sort_order: 2 },
        ],
      },
      {
        title: '余隆、曾韵与国家大剧院管弦乐团',
        subtitle: '余隆首次执棒国家大剧院管弦乐团乐季',
        description: '著名指挥家余隆首次执棒国家大剧院管弦乐团乐季音乐会！携手柏林爱乐终身圆号首席曾韵，演绎韦伯、莫扎特与拉赫玛尼诺夫的经典作品。',
        date_time: '2026-07-17T19:30:00',
        venue_id: venueBJArt.id, orchestra_id: ncpao.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '余隆' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: weber.id, piece_name: 'Overture to Der Freischütz', piece_name_zh: '《自由射手》序曲', sort_order: 0 },
          { composer_id: mozart.id, piece_name: 'Horn Concerto No.4 in E-flat major, K.495', piece_name_zh: '降E大调第四圆号协奏曲', opus_number: 'K.495', sort_order: 1 },
          { composer_id: rach.id, piece_name: 'Symphony No.2 in E minor, Op.27', piece_name_zh: 'e小调第二交响曲', opus_number: 'Op.27', sort_order: 2 },
        ],
      },
      {
        title: '纪念肖斯塔科维奇诞辰120周年 & 中国交响乐团成立70周年',
        subtitle: '戴维·霍斯执棒中国交响乐团',
        description: '中国交响乐团成立70周年庆典音乐会，美国指挥家戴维·霍斯执棒，演绎肖斯塔科维奇G小调第十一交响曲"1905年"和拉赫玛尼诺夫合唱交响《钟声》，中国交响乐团合唱团联袂献演。',
        date_time: '2026-07-19T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: cnso.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '戴维·霍斯' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: shosta.id, piece_name: 'Symphony No.11 in G minor, Op.103 "The Year 1905"', piece_name_zh: 'g小调第十一交响曲"1905年"', opus_number: 'Op.103', sort_order: 0 },
          { composer_id: rach.id, piece_name: 'The Bells, Op.35', piece_name_zh: '合唱交响曲《钟声》', opus_number: 'Op.35', sort_order: 1 },
        ],
      },
      {
        title: '"命运号角" — 委内瑞拉青年交响乐团音乐会',
        subtitle: '委内瑞拉胡安·何塞·兰达埃塔交响乐团',
        description: '来自委内瑞拉的青年交响乐团（15-25岁），以其活力四射的表演风格融合拉丁节奏与古典交响传统，为北京观众带来一场充满南美风情的交响盛宴。',
        date_time: '2026-07-22T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: venezuela.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
      },
      {
        title: '"夏日激情" — 金野、黎雨荷与中国音乐学院交响乐团',
        subtitle: '从科斯马到皮亚佐拉：四季主题音乐会',
        description: '指挥家金野携手小提琴家黎雨荷，以四季为主题，演绎科斯马、吉纳斯特拉和皮亚佐拉笔下的"四季"作品，呈现不同文化视角下的季节之美。',
        date_time: '2026-07-24T19:30:00',
        venue_id: venueNCPA.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '金野' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: piazzolla.id, piece_name: 'The Four Seasons of Buenos Aires', piece_name_zh: '布宜诺斯艾利斯的四季', sort_order: 0 },
        ],
      },
      {
        title: '"夏夜弦歌·经典回响" — 中国电影乐团交响音画音乐会',
        subtitle: '电影音乐与交响的完美融合',
        description: '中国电影乐团带来的交响音画音乐会，精选经典电影音乐，以交响乐的形式重现银幕上的动人旋律。',
        date_time: '2026-07-25T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: chinaFilm.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
      },
      {
        title: '贝多芬第九交响曲"欢乐颂"',
        subtitle: '杨洋、鞠小夫与北京交响乐团',
        description: '指挥家杨洋执棒北京交响乐团，钢琴家鞠小夫独奏，中央歌剧院合唱团献唱。上半场带来莫扎特C大调第二十五钢琴协奏曲，下半场震撼演绎贝多芬第九交响曲"合唱"——全人类共同的精神赞歌。',
        date_time: '2026-07-26T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: bso.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '杨洋' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: mozart.id, piece_name: 'Piano Concerto No.25 in C major, K.503', piece_name_zh: 'C大调第二十五钢琴协奏曲', opus_number: 'K.503', sort_order: 0 },
          { composer_id: beethoven.id, piece_name: 'Symphony No.9 in D minor, Op.125 "Choral"', piece_name_zh: 'd小调第九交响曲"合唱"', opus_number: 'Op.125', sort_order: 1 },
        ],
      },
      {
        title: '漫步经典闭幕："少年的号角"',
        subtitle: '俞峰、李晶晶与国家大剧院管弦乐团',
        description: '第十七届"漫步经典"系列闭幕音乐会。指挥家俞峰执棒，女高音李晶晶加盟，演绎马勒A小调钢琴四重奏与G大调第四交响曲，以马勒纯真而深邃的音乐为本届音乐节画上完美句号。',
        date_time: '2026-07-30T19:30:00',
        venue_id: venueNCPA.id, orchestra_id: ncpao.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '俞峰' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: mahler.id, piece_name: 'Piano Quartet in A minor', piece_name_zh: 'a小调钢琴四重奏', sort_order: 0 },
          { composer_id: mahler.id, piece_name: 'Symphony No.4 in G major', piece_name_zh: 'G大调第四交响曲', sort_order: 1 },
        ],
      },
      {
        title: '"夏日清风"管风琴音乐会',
        subtitle: '沈凡秀与朋友们的管风琴音乐会',
        description: '管风琴演奏家沈凡秀带来的夏日管风琴专场，演出巴赫、维瓦尔第、关乃忠等作曲家的管风琴经典作品，在北京艺术中心的绝佳声学环境中感受"乐器之王"的魅力。',
        date_time: '2026-07-25T14:30:00',
        venue_id: venueBJArt.id,
        conductor_id: (await Conductor.findOne({ where: { name_zh: '沈凡秀' } })).id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
        pieces: [
          { composer_id: bach.id, piece_name: 'Organ Works', piece_name_zh: '管风琴作品选', sort_order: 0 },
          { composer_id: vivaldi.id, piece_name: 'Organ Concertos', piece_name_zh: '管风琴协奏曲', sort_order: 1 },
        ],
      },
      {
        title: '"指尖上的阳光" — 刘浩钢琴独奏音乐会',
        subtitle: '北京艺术中心·小剧场',
        description: '钢琴家刘浩带来的独奏音乐会，精选古典与浪漫时期的钢琴杰作。',
        date_time: '2026-07-18T19:30:00',
        venue_id: venueBJArt.id,
        status: 'published', source: '国家大剧院官网', source_verified: true,
      },
    ];

    let added = 0;
    for (const data of performances) {
      const { pieces, ...perfFields } = data;
      const existing = await Performance.findOne({
        where: { title: perfFields.title, date_time: perfFields.date_time },
      });
      if (existing) {
        console.log(`  ~ 已存在: ${perfFields.title}`);
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

seedReal();

/**
 * 贵阳交响乐团 2025-2026 第十七音乐季 — 批量导入脚本
 * 数据来源：贵阳交响乐团官方微信公众号、贵阳日报/贵阳晚报、乐团官网 gyso.cn
 * 运行: node src/config/import-gyso-season.js
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
async function importGYSOSeason() {
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
      'Guiyang Grand Theatre · Concert Hall',
      '贵阳大剧院·音乐厅',
      '贵阳'
    );
    console.log(`  场地: ${guiyangTheatre.name_zh} (ID=${guiyangTheatre.id})`);

    // ---- 作曲家 ----
    const composers = {};
    const compData = [
      // [name, nameZh, birth, death, era]
      ['Ludwig van Beethoven', '贝多芬', 1770, 1827, 'Classical'],
      ['Wolfgang Amadeus Mozart', '莫扎特', 1756, 1791, 'Classical'],
      ['Pyotr Ilyich Tchaikovsky', '柴可夫斯基', 1840, 1893, 'Romantic'],
      ['Dmitri Shostakovich', '肖斯塔科维奇', 1906, 1975, 'Modern'],
      ['Richard Wagner', '瓦格纳', 1813, 1883, 'Romantic'],
      ['Max Bruch', '布鲁赫', 1838, 1920, 'Romantic'],
      ['Igor Stravinsky', '斯特拉文斯基', 1882, 1971, 'Modern'],
      ['Edward Elgar', '埃尔加', 1857, 1934, 'Romantic'],
      ['Johannes Brahms', '勃拉姆斯', 1833, 1897, 'Romantic'],
      ['Richard Strauss', '理查·施特劳斯', 1864, 1949, 'Romantic'],
      ['Gustav Mahler', '马勒', 1860, 1911, 'Romantic'],
      ['Robert Schumann', '舒曼', 1810, 1856, 'Romantic'],
      ['Franz Schubert', '舒伯特', 1797, 1828, 'Classical'],
      ['Sergei Rachmaninoff', '拉赫玛尼诺夫', 1873, 1943, 'Romantic'],
      ['Benjamin Britten', '布里顿', 1913, 1976, 'Modern'],
      ['Camille Saint-Saëns', '圣桑', 1835, 1921, 'Romantic'],
      ['Francis Poulenc', '普朗克', 1899, 1963, 'Modern'],
      ['Giulio Briccialdi', '布里西阿尔迪', 1818, 1881, 'Romantic'],
      ['Anatoly Lyadov', '利亚多夫', 1855, 1914, 'Romantic'],
      ['Alexander Arutiunian', '阿鲁秋年', 1920, 2012, 'Modern'],
      ['Ye Xiaogang', '叶小纲', 1955, null, 'Contemporary'],
      ['Li Huanzhi', '李焕之', 1919, 2000, 'Modern'],
      ['Johann Pachelbel', '帕赫贝尔', 1653, 1706, 'Baroque'],
      ['Arcangelo Corelli', '科雷利', 1653, 1713, 'Baroque'],
      ['Johann Sebastian Bach', '巴赫', 1685, 1750, 'Baroque'],
      ['Antonio Vivaldi', '维瓦尔第', 1678, 1741, 'Baroque'],
      ['George Frideric Handel', '亨德尔', 1685, 1759, 'Baroque'],
      ['Gaetano Donizetti', '多尼采蒂', 1797, 1848, 'Romantic'],
      ['Mauro Giuliani', '朱利亚尼', 1781, 1829, 'Classical'],
      ['Gioachino Rossini', '罗西尼', 1792, 1868, 'Romantic'],
      ['Jan Koetsier', '扬·科特西尔', 1911, 2006, 'Modern'],
      ['Tan Dun', '谭盾', 1957, null, 'Contemporary'],
      ['Modest Mussorgsky', '穆索尔斯基', 1839, 1881, 'Romantic'],
    ];
    for (const [name, nameZh, birth, death, era] of compData) {
      composers[nameZh] = await findOrCreateComposer(name, nameZh, birth, death, era);
    }
    console.log(`  作曲家: ${Object.keys(composers).length} 位就绪`);

    // ---- 指挥家 ----
    const conductors = {};
    const condData = [
      ['Zhang Guoyong', '张国勇', '中国'],
      ['Dong Chao', '董超', '中国'],
      ['Vyacheslav Chernukho-Volich', '维亚切斯拉夫·切尔努霍-沃利奇', '俄罗斯'],
      ['Zhang Lu', '张橹', '中国'],
      ['Yang Yang', '杨洋', '中国'],
      ['Sun Yifan', '孙一凡', '中国'],
      ['Huang Yi', '黄屹', '中国'],
      ['Yu Lu', '俞潞', '中国'],
      ['Andreas Delfs', '安德烈亚斯·德尔夫斯', '德国'],
      ['Lin Daye', '林大叶', '中国'],
      ['Yip Wing-sie', '叶咏诗', '中国'],
      ['Ning Feng', '宁峰', '中国'],
      ['Tan Dun', '谭盾', '中国'],
      ['Chan Kwong-ming', '陈康明', '新加坡'],
      ['Jing Huan', '景焕', '中国'],
    ];
    for (const [name, nameZh, nationality] of condData) {
      conductors[nameZh] = await findOrCreateConductor(name, nameZh, nationality);
    }
    console.log(`  指挥家: ${Object.keys(conductors).length} 位就绪`);

    // ---- 演奏家 ----
    const performers = {};
    const perfData = [
      ['Song Siheng', '宋思衡', '钢琴', '中国'],
      ['Huang Mengla', '黄蒙拉', '小提琴', '中国'],
      ['Tan Xiaotang', '谭小棠', '钢琴', '中国'],
      ['Feng Yongzhi', '冯勇智', '大提琴', '中国'],
      ['Lana Trotovšek', '拉娜·特罗托夫舍克', '小提琴', '斯洛文尼亚'],
      ['Liu Yunzhi', '刘云志', '小提琴', '中国'],
      ['Ma Yong', '马勇', '长笛', '中国'],
      ['Chen Sa', '陈萨', '钢琴', '中国'],
      ['Selina Ott', '塞琳娜·奥特', '小号', '奥地利'],
      ['Chloe Chua', '蔡珂宜', '小提琴', '新加坡'],
      ['Shi Yijie', '石倚洁', '男高音', '中国'],
      ['Wu Tongyu', '吴桐雨', '女高音', '中国'],
      ['Ren Ting', '任廷', '男中音', '中国'],
      ['Xia Deqi', '夏德奇', '男高音', '中国'],
      ['Song Yuanming', '宋元明', '女高音', '中国'],
      ['Zhang Jinru', '张金茹', '小提琴', '中国'],
      ['Sun Yingdi', '孙颖迪', '钢琴', '中国'],
      ['Wang Zhijiong', '王之炅', '小提琴', '中国'],
      ['Han Yan', '韩妍', '琵琶', '中国'],
      ['Sun Jingchen', '孙菁晨', '马林巴', '中国'],
      ['Ning Feng', '宁峰', '小提琴', '中国'],
      ['Weimar Trombone Quartet', '魏玛长号四重奏', '长号', '德国'],
    ];
    for (const [name, nameZh, instrument, nationality] of perfData) {
      performers[nameZh] = await findOrCreatePerformer(name, nameZh, instrument, nationality);
    }
    console.log(`  演奏家: ${Object.keys(performers).length} 位就绪`);

    // ========== 演出数据 ==========
    console.log('\n--- 开始导入演出 ---');

    const allPerformances = [
      // ============ 聚焦经典 MASTERWORKS ============
      {
        title: '开幕音乐会——纪念抗战胜利80周年',
        description: '贵阳交响乐团第十七音乐季开幕音乐会，纪念中国人民抗日战争暨世界反法西斯战争胜利80周年。',
        date_time: '2025-09-13 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '肖斯塔科维奇', piece_name: 'The Gadfly Suite: Folk Festival', piece_name_zh: '《民间节日》（选自《牛虻》组曲）' },
          { composer: '肖斯塔科维奇', piece_name: 'Piano Concerto No.2 in F major, Op.102', piece_name_zh: 'F大调第二钢琴协奏曲', opus_number: 'Op.102' },
          { composer: '肖斯塔科维奇', piece_name: 'Symphony No.7 in C major, Op.60 "Leningrad"', piece_name_zh: 'C大调第七交响曲"列宁格勒"', opus_number: 'Op.60' },
        ],
        performers_list: [{ performer: '宋思衡', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '浪漫主义的不同切面',
        date_time: '2025-09-26 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '董超',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '瓦格纳', piece_name: 'Siegfried Idyll', piece_name_zh: '齐格弗里德牧歌' },
          { composer: '布鲁赫', piece_name: 'Scottish Fantasy, Op.46', piece_name_zh: '苏格兰幻想曲', opus_number: 'Op.46' },
          { composer: '柴可夫斯基', piece_name: 'Serenade for Strings in C major, Op.48', piece_name_zh: 'C大调弦乐小夜曲', opus_number: 'Op.48' },
          { composer: '斯特拉文斯基', piece_name: 'Danses concertantes', piece_name_zh: '协奏舞曲' },
        ],
        performers_list: [{ performer: '黄蒙拉', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '柴作专场·曼弗雷德',
        date_time: '2025-10-17 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '维亚切斯拉夫·切尔努霍-沃利奇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '柴可夫斯基', piece_name: 'Polonaise from Eugene Onegin', piece_name_zh: '波罗乃兹舞曲（选自《叶甫盖尼·奥涅金》）' },
          { composer: '柴可夫斯基', piece_name: 'Piano Concerto No.1 in B-flat minor, Op.23', piece_name_zh: '降b小调第一钢琴协奏曲', opus_number: 'Op.23' },
          { composer: '柴可夫斯基', piece_name: 'Manfred Symphony, Op.58', piece_name_zh: '曼弗雷德交响曲', opus_number: 'Op.58' },
        ],
        performers_list: [{ performer: '谭小棠', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '"金钟归来"：致乐迷',
        date_time: '2025-11-01 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        description: '贵阳交响乐团第四次受邀参加"金钟奖"后回黔举办的专场音乐会。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '叶小纲作品专场',
        date_time: '2025-11-07 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '叶小纲', piece_name: 'The Last Paradise', piece_name_zh: '小提琴协奏曲《最后的乐园》' },
          { composer: '叶小纲', piece_name: 'Farewell My Concubine – Symphonic Suite', piece_name_zh: '交响组曲《咏别》' },
        ],
        performers_list: [],
      },
      {
        title: '爱的谜语——埃尔加作品专场',
        date_time: '2025-11-21 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张橹',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '埃尔加', piece_name: 'Salut d\'Amour, Op.12', piece_name_zh: '爱的致意', opus_number: 'Op.12' },
          { composer: '埃尔加', piece_name: 'Cello Concerto in E minor, Op.85', piece_name_zh: 'e小调大提琴协奏曲', opus_number: 'Op.85' },
          { composer: '埃尔加', piece_name: 'Variations on an Original Theme "Enigma", Op.36', piece_name_zh: '"谜语"变奏曲', opus_number: 'Op.36' },
        ],
        performers_list: [{ performer: '冯勇智', role: 'soloist', instrument: '大提琴' }],
      },
      {
        title: '唐诗的回响——来自世界各地的中文颂',
        date_time: '2025-12-05 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '杨洋',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        description: '各国歌唱家用中文演唱唐诗改编作品，中西合璧。包含李白《将进酒》《静夜思》、刘禹锡《竹枝词》、白居易《赋得古原草送别》、王勃《送杜少府之任蜀州》、王翰《凉州词》、高适《别董大》、杜甫《闻官军收河南河北》、张继《枫桥夜泊》（评弹清唱+管弦乐版）、崔颢《黄鹤楼》等十余首。',
        pieces: [
          { composer: '李焕之', piece_name: 'Spring Festival Overture', piece_name_zh: '春节序曲' },
        ],
        performers_list: [],
      },
      {
        title: '贝多芬&莫扎特之夜——张国勇×拉娜',
        date_time: '2025-12-19 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '贝多芬', piece_name: 'Coriolan Overture, Op.62', piece_name_zh: '科里奥兰序曲', opus_number: 'Op.62' },
          { composer: '莫扎特', piece_name: 'Violin Concerto No.4 in D major, K.218', piece_name_zh: 'D大调第四小提琴协奏曲', opus_number: 'K.218' },
          { composer: '贝多芬', piece_name: 'Symphony No.4 in B-flat major, Op.60', piece_name_zh: '降B大调第四交响曲', opus_number: 'Op.60' },
        ],
        performers_list: [{ performer: '拉娜·特罗托夫舍克', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '新年音乐会——森林之歌',
        subtitle: '跨年场连演至零点',
        date_time: '2025-12-31 22:30',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '肖斯塔科维奇', piece_name: 'The Song of the Forests, Op.81', piece_name_zh: '清唱剧《森林之歌》', opus_number: 'Op.81' },
        ],
        performers_list: [],
      },
      {
        title: 'GYSO老友记',
        date_time: '2026-01-09 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [],
        performers_list: [{ performer: '刘云志', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '长笛的奏鸣与狂欢',
        date_time: '2026-01-23 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '孙一凡',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '圣桑', piece_name: 'Danse de Bacchus from Samson et Dalila', piece_name_zh: '酒神之舞' },
          { composer: '普朗克', piece_name: 'Flute Sonata', piece_name_zh: '长笛奏鸣曲' },
          { composer: '布里西阿尔迪', piece_name: 'Il Carnevale di Venezia', piece_name_zh: '威尼斯狂欢节' },
          { composer: '柴可夫斯基', piece_name: 'Symphony No.1 in G minor "Winter Dreams", Op.13', piece_name_zh: 'g小调第一交响曲"冬日之梦"', opus_number: 'Op.13' },
        ],
        performers_list: [{ performer: '马勇', role: 'soloist', instrument: '长笛' }],
      },
      {
        title: '尽情贝多芬 1 —— 🎹马拉松',
        subtitle: '贝多芬钢琴协奏曲马拉松（上）',
        date_time: '2026-02-06 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '贝多芬', piece_name: 'Piano Concerto No.1 in C major, Op.15', piece_name_zh: 'C大调第一钢琴协奏曲', opus_number: 'Op.15' },
          { composer: '贝多芬', piece_name: 'Piano Concerto No.2 in B-flat major, Op.19', piece_name_zh: '降B大调第二钢琴协奏曲', opus_number: 'Op.19' },
          { composer: '贝多芬', piece_name: 'Piano Concerto No.3 in C minor, Op.37', piece_name_zh: 'c小调第三钢琴协奏曲', opus_number: 'Op.37' },
        ],
        performers_list: [{ performer: '陈萨', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '尽情贝多芬 2 —— 🎹马拉松',
        subtitle: '贝多芬钢琴协奏曲马拉松（下）',
        date_time: '2026-02-07 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '贝多芬', piece_name: 'Piano Concerto No.4 in G major, Op.58', piece_name_zh: 'G大调第四钢琴协奏曲', opus_number: 'Op.58' },
          { composer: '贝多芬', piece_name: 'Piano Concerto No.5 in E-flat major "Emperor", Op.73', piece_name_zh: '降E大调第五钢琴协奏曲"皇帝"', opus_number: 'Op.73' },
        ],
        performers_list: [{ performer: '陈萨', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '从民歌到交响诗篇·亚美尼亚的号角',
        date_time: '2026-03-13 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '黄屹',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '利亚多夫', piece_name: 'Eight Russian Folk Songs, Op.58', piece_name_zh: '八首俄罗斯民歌', opus_number: 'Op.58' },
          { composer: '阿鲁秋年', piece_name: 'Trumpet Concerto in A-flat major', piece_name_zh: '降A大调小号协奏曲' },
          { composer: '拉赫玛尼诺夫', piece_name: 'Symphonic Dances, Op.45', piece_name_zh: '交响舞曲', opus_number: 'Op.45' },
        ],
        performers_list: [{ performer: '塞琳娜·奥特', role: 'soloist', instrument: '小号' }],
      },
      {
        title: '蔡珂宜×布鲁赫"小协"',
        date_time: '2026-03-27 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '布鲁赫', piece_name: 'Violin Concerto No.1 in G minor, Op.26', piece_name_zh: 'g小调第一小提琴协奏曲', opus_number: 'Op.26' },
          { composer: '理查·施特劳斯', piece_name: 'Also sprach Zarathustra, Op.30', piece_name_zh: '查拉图斯特拉如是说', opus_number: 'Op.30' },
        ],
        performers_list: [{ performer: '蔡珂宜', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '马勒六：漫长的末乐章',
        date_time: '2026-04-10 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '俞潞',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '马勒', piece_name: 'Symphony No.6 in A minor "Tragic"', piece_name_zh: 'a小调第六号交响曲"悲剧"' },
        ],
        performers_list: [],
      },
      {
        title: '德尔夫斯×德奥之作',
        date_time: '2026-04-24 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '安德烈亚斯·德尔夫斯',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '勃拉姆斯', piece_name: 'Violin Concerto in D major, Op.77', piece_name_zh: 'D大调小提琴协奏曲', opus_number: 'Op.77' },
          { composer: '理查·施特劳斯', piece_name: 'Don Juan, Op.20', piece_name_zh: '唐璜', opus_number: 'Op.20' },
          { composer: '理查·施特劳斯', piece_name: 'Der Rosenkavalier Suite', piece_name_zh: '玫瑰骑士组曲' },
        ],
        performers_list: [{ performer: '王之炅', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '倚石听声：中外经典声乐作品音乐会',
        date_time: '2026-05-15 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [],
        performers_list: [
          { performer: '石倚洁', role: 'soloist', instrument: '男高音' },
          { performer: '吴桐雨', role: 'soloist', instrument: '女高音' },
          { performer: '任廷', role: 'soloist', instrument: '男中音' },
          { performer: '夏德奇', role: 'soloist', instrument: '男高音' },
        ],
      },
      {
        title: '马勒七：黑夜之乐',
        date_time: '2026-05-29 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '林大叶',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '马勒', piece_name: 'Symphony No.7 in E minor', piece_name_zh: 'e小调第七交响曲' },
        ],
        performers_list: [],
      },
      {
        title: '弦乐与歌唱·布里顿的"光"与协奏曲',
        date_time: '2026-06-12 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '布里顿', piece_name: 'Death in Venice (excerpts)', piece_name_zh: '歌剧《魂断威尼斯》（选段）' },
          { composer: '布里顿', piece_name: 'Violin Concerto, Op.15', piece_name_zh: '小提琴协奏曲', opus_number: 'Op.15' },
          { composer: '布里顿', piece_name: 'The Light', piece_name_zh: '《光》' },
        ],
        performers_list: [
          { performer: '宋元明', role: 'soloist', instrument: '女高音' },
          { performer: '张金茹', role: 'soloist', instrument: '小提琴' },
        ],
      },
      {
        title: '舒曼与"诗"',
        date_time: '2026-06-26 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '叶咏诗',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '舒曼', piece_name: 'Manfred Overture, Op.115', piece_name_zh: '曼弗雷德序曲', opus_number: 'Op.115' },
          { composer: '舒曼', piece_name: 'Piano Concerto in A minor, Op.54', piece_name_zh: 'a小调钢琴协奏曲', opus_number: 'Op.54' },
          { composer: '舒曼', piece_name: 'Symphony No.2 in C major, Op.61', piece_name_zh: 'C大调第二交响曲', opus_number: 'Op.61' },
        ],
        performers_list: [{ performer: '孙颖迪', role: 'soloist', instrument: '钢琴' }],
      },
      {
        title: '宁峰的双重莫扎特',
        date_time: '2026-07-03 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '宁峰',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        description: '宁峰身兼指挥与小提琴双重身份演绎莫扎特经典。',
        pieces: [
          { composer: '莫扎特', piece_name: 'Le nozze di Figaro Overture, K.492', piece_name_zh: '《费加罗的婚礼》序曲', opus_number: 'K.492' },
          { composer: '莫扎特', piece_name: 'Violin Concerto No.3 in G major, K.216', piece_name_zh: 'G大调第三小提琴协奏曲', opus_number: 'K.216' },
          { composer: '莫扎特', piece_name: 'Adagio in E major, K.261', piece_name_zh: 'E大调慢板', opus_number: 'K.261' },
          { composer: '莫扎特', piece_name: 'Symphony No.41 in C major "Jupiter", K.551', piece_name_zh: 'C大调第四十一交响曲"朱庇特"', opus_number: 'K.551' },
        ],
        performers_list: [{ performer: '宁峰', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '峰·奏',
        subtitle: '宁峰室内乐专场',
        date_time: '2026-07-04 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '贝多芬', piece_name: 'Septet in E-flat major, Op.20', piece_name_zh: '降E大调七重奏', opus_number: 'Op.20' },
          { composer: '舒伯特', piece_name: 'Octet in F major, D.803', piece_name_zh: 'F大调八重奏', opus_number: 'D.803' },
        ],
        performers_list: [{ performer: '宁峰', role: 'soloist', instrument: '小提琴' }],
      },
      {
        title: '纪念斯特拉文斯基逝世55周年',
        date_time: '2026-07-17 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '谭盾',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        description: '谭盾执棒，纪念斯特拉文斯基逝世55周年专场音乐会。',
        pieces: [],
        performers_list: [
          { performer: '韩妍', role: 'soloist', instrument: '琵琶' },
          { performer: '孙菁晨', role: 'soloist', instrument: '马林巴' },
        ],
      },
      {
        title: '闭幕音乐会——阿尔卑斯山的共鸣',
        date_time: '2026-07-31 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '张国勇',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '聚焦经典',
        pieces: [
          { composer: '瓦格纳', piece_name: 'Der fliegende Holländer Overture', piece_name_zh: '《漂泊的荷兰人》序曲' },
          { composer: '扬·科特西尔', piece_name: 'Trombone Quartet Concertino', piece_name_zh: '长号四重奏小协奏曲' },
          { composer: '理查·施特劳斯', piece_name: 'Eine Alpensinfonie, Op.64', piece_name_zh: '阿尔卑斯山交响曲', opus_number: 'Op.64' },
        ],
        performers_list: [{ performer: '魏玛长号四重奏', role: 'guest_ensemble', instrument: '长号' }],
      },

      // ============ 贵交聚光灯 GYSO's SPOTLIGHT ============
      {
        title: '"敲敲话"——打击乐重奏音乐会',
        date_time: '2025-11-28 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '打击乐重奏音乐会——贵交聚光灯系列。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '"木质调"——木管重奏音乐会',
        date_time: '2026-01-16 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '木管重奏音乐会。曲目包含里姆斯基-科萨科夫《降B大调木管与钢琴五重奏》、莫扎特《降E大调管乐小夜曲 K.375》等。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '"拉啦Land"——弦乐重奏音乐会',
        date_time: '2026-01-30 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '弦乐重奏音乐会——贵交聚光灯系列。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '"黑白故事"——钢琴室内乐',
        date_time: '2026-04-03 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '钢琴室内乐专场——贵交聚光灯系列。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '莫扎特的大作与小曲',
        date_time: '2026-04-17 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '莫扎特经典作品室内乐专场——贵交聚光灯系列。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '璀璨巴洛克',
        date_time: '2026-05-22 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '巴洛克经典荟萃：帕赫贝尔《卡农》、科雷利《大协奏曲》、巴赫《G弦上的咏叹调》、维瓦尔第《短笛协奏曲》、亨德尔《竖琴协奏曲》等。',
        pieces: [
          { composer: '帕赫贝尔', piece_name: 'Canon in D', piece_name_zh: 'D大调卡农' },
          { composer: '科雷利', piece_name: 'Concerto Grosso', piece_name_zh: '大协奏曲' },
          { composer: '巴赫', piece_name: 'Air on the G String', piece_name_zh: 'G弦上的咏叹调' },
          { composer: '维瓦尔第', piece_name: 'Piccolo Concerto', piece_name_zh: '短笛协奏曲' },
          { composer: '亨德尔', piece_name: 'Harp Concerto', piece_name_zh: '竖琴协奏曲' },
        ],
        performers_list: [],
      },
      {
        title: '弦乐四重奏——肖斯塔科维奇诞辰120周年',
        date_time: '2026-06-05 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '纪念肖斯塔科维奇诞辰120周年弦乐四重奏专场。包含第7弦乐四重奏、两首小品、第9弦乐四重奏。',
        pieces: [
          { composer: '肖斯塔科维奇', piece_name: 'String Quartet No.7 in F-sharp minor, Op.108', piece_name_zh: '第7弦乐四重奏', opus_number: 'Op.108' },
          { composer: '肖斯塔科维奇', piece_name: 'Two Pieces for String Quartet', piece_name_zh: '两首小品' },
          { composer: '肖斯塔科维奇', piece_name: 'String Quartet No.9 in E-flat major, Op.117', piece_name_zh: '第9弦乐四重奏', opus_number: 'Op.117' },
        ],
        performers_list: [],
      },
      {
        title: '意式弦乐三原色',
        date_time: '2026-07-10 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '贵交聚光灯',
        description: '意大利作曲家弦乐作品专场：多尼采蒂、朱利亚尼、罗西尼。',
        pieces: [],
        performers_list: [],
      },

      // ============ 艺述PRO+ ARTTALES ============
      {
        title: '"贵交"16岁生日音乐会',
        date_time: '2025-09-19 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '艺述PRO+',
        description: '贵阳交响乐团成立16周年庆祝音乐会。采用"开盲盒"售票方式。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '松树上的银铃乐章',
        date_time: '2025-12-24 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '陈康明',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '艺述PRO+',
        description: '圣诞夜专场音乐会，陈康明执棒与乐迷共度圣诞。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '元宵节音乐会',
        date_time: '2026-02-28 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '艺述PRO+',
        description: '元宵佳节专场音乐会。',
        pieces: [],
        performers_list: [],
      },
      {
        title: 'Lady First 女士之夜',
        date_time: '2026-03-06 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        conductor_name: '景焕',
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '艺述PRO+',
        description: '三八妇女节主题音乐会，景焕执棒。',
        pieces: [],
        performers_list: [],
      },
      {
        title: '儿童节音乐会',
        date_time: '2026-06-01 20:00',
        orchestra_id: gyso.id, venue_id: guiyangTheatre.id,
        status: 'published', source: '贵阳交响乐团官方公众号', source_url: 'https://mp.weixin.qq.com/s/bxPCpouOxjgz98M9Frb5wQ',
        series: '艺述PRO+',
        description: '六一儿童节专场音乐会。',
        pieces: [],
        performers_list: [],
      },
    ];

    // ========== 逐条插入（仅导入未上演的） ==========
    const now = new Date();
    let added = 0;
    let skippedPast = 0;
    let skippedExist = 0;

    for (const data of allPerformances) {
      const { pieces, performers_list, conductor_name, series, ...perfFields } = data;

      // 跳过已过去的演出
      const perfDate = new Date(data.date_time);
      if (perfDate <= now) {
        console.log(`  - 已过去: ${data.title} (${data.date_time})`);
        skippedPast++;
        continue;
      }

      // 检查是否已存在（同标题+同日期）
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

      // 添加系列信息
      if (series) {
        perfFields.program_notes = perfFields.program_notes
          ? `【${series}】${perfFields.program_notes}`
          : `【${series}】`;
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

      console.log(`  + ${data.title} (${data.date_time}) [${series || '-'}]`);
      added++;
    }

    console.log(`\n✅ 导入完成: 新增 ${added} 场, 已过去跳过 ${skippedPast} 场, 已存在跳过 ${skippedExist} 场 (共 ${allPerformances.length} 场)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

importGYSOSeason();

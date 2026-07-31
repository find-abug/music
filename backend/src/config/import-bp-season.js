// 批量导入柏林爱乐2026/27乐季
// 数据来源: 柏林爱乐中国官方微信公众号
const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    const opts = {hostname:'localhost',port:3000,path,method:'POST',
      headers:{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(json)}};
    const req = http.request(opts, res => {
      let body=''; res.on('data',c=>body+=c); res.on('end',()=>resolve(JSON.parse(body)));
    });
    req.on('error',reject); req.write(json); req.end();
  });
}

async function main() {
  // 1. Add composers
  const composers = [
    ['Paul Hindemith','保罗·欣德米特','1895','1963','Modern','德国作曲家、中提琴家，20世纪新古典主义代表人物。'],
    ['Olivier Messiaen','奥利维埃·梅西安','1908','1992','Modern','法国作曲家、管风琴家，20世纪最具影响力的作曲家之一。'],
    ['Ottorino Respighi','奥托里诺·雷斯庇基','1879','1936','Modern','意大利作曲家，以罗马三部曲闻名于世。'],
    ['Giuseppe Martucci','朱塞佩·马图奇','1856','1909','Romantic','意大利作曲家、指挥家、钢琴家。'],
    ['Brett Dean','布雷特·迪恩','1961',null,'Contemporary','澳大利亚作曲家、中提琴家。'],
    ['Cathy Milliken','凯茜·米利肯',null,null,'Contemporary','澳大利亚作曲家。'],
    ['Sarah Nemtsov','萨拉·内姆佐夫','1980',null,'Contemporary','德国作曲家。'],
    ['Alphons Diepenbrock','阿尔丰斯·迪彭布罗克','1862','1921','Romantic','荷兰作曲家。'],
    ['Lili Boulanger','莉莉·布朗热','1893','1918','Modern','法国作曲家，首位获得罗马大奖的女性作曲家。'],
    ['Thomas Larcher','托马斯·拉切','1963',null,'Contemporary','奥地利作曲家。'],
    ['Sofia Gubaidulina','索菲亚·古拜杜林娜','1931',null,'Modern','俄罗斯裔作曲家，20世纪最具原创性的作曲家之一。'],
    ['Witold Lutosławski','维托尔德·卢托斯拉夫斯基','1913','1994','Modern','波兰作曲家、指挥家，20世纪重要作曲家。'],
    ['Otto Nicolai','奥托·尼科莱','1810','1849','Romantic','德国作曲家，维也纳爱乐乐团创始人。'],
    ['Engelbert Humperdinck','恩格尔伯特·洪佩尔丁克','1854','1921','Romantic','德国作曲家，以歌剧《糖果屋》闻名。'],
    ['Pablo de Sarasate','帕布罗·德·萨拉萨蒂','1844','1908','Romantic','西班牙小提琴家、作曲家。'],
  ];
  const compIds = {};
  for (const [name,name_zh,birth,death,era,bio] of composers) {
    const r = await post('/api/composers',{name,name_zh,birth_year:birth?parseInt(birth):null,death_year:death?parseInt(death):null,era,bio});
    compIds[name] = r.id;
    console.log('Composer:', r.id, name_zh);
  }

  // 2. Add conductors
  const conductors = [
    ['Kirill Petrenko','基里尔·别特连科','俄罗斯','柏林爱乐乐团首席指挥。曾任巴伐利亚国立歌剧院音乐总监。'],
    ['Daniel Harding','丹尼尔·哈丁','英国','英国指挥家，曾任瑞典广播交响乐团音乐总监，巴黎管弦乐团音乐总监。'],
    ['Ivan Fischer','伊万·费舍尔','匈牙利','匈牙利指挥家，布达佩斯节日管弦乐团创始人和音乐总监。'],
    ['Zubin Mehta','祖宾·梅塔','印度','印度裔指挥家，曾任纽约爱乐和以色列爱乐音乐总监。'],
    ['Maxim Emelyanychev','马克西姆·埃梅里亚尼切夫','俄罗斯','俄罗斯指挥家和大键琴家，苏格兰室内乐团首席指挥。'],
    ['Marek Janowski','马雷克·亚诺夫斯基','德国','德国指挥家，以演绎德奥浪漫主义曲目著称。'],
    ['Maxime Pascal','马克西姆·帕斯卡尔','法国','法国指挥家。'],
    ['Jakub Hrůša','雅各布·赫卢萨','捷克','捷克指挥家，英国皇家歌剧院音乐总监。'],
    ['François-Xavier Roth','弗朗索瓦-萨维埃·罗特','法国','法国指挥家，科隆居策尼希管弦乐团音乐总监。'],
    ['Sakari Oramo','萨卡里·奥拉莫','芬兰','芬兰指挥家，BBC交响乐团首席指挥。'],
    ['Markus Poschner','马库斯·波什纳','德国','德国指挥家。'],
    ['Lahav Shani','拉哈夫·沙尼','以色列','以色列指挥家、钢琴家，以色列爱乐乐团音乐总监。'],
    ['Tugan Sokhiev','图甘·索基耶夫','俄罗斯','俄罗斯指挥家，曾任莫斯科大剧院音乐总监。'],
    ['Klaus Mäkelä','克劳斯·麦凯莱','芬兰','芬兰指挥家，阿姆斯特丹皇家音乐厅管弦乐团和芝加哥交响乐团音乐总监。'],
    ['Elim Chan','陈以琳','中国','中国香港指挥家，安特卫普交响乐团首席指挥。'],
    ['Alan Gilbert','艾伦·吉尔伯特','美国','美国指挥家，北德广播易北爱乐乐团首席指挥。'],
    ['Dima Slobodeniouk','蒂玛·斯洛伯登尼乌克','芬兰','芬兰-俄罗斯指挥家，拉赫蒂交响乐团首席指挥。'],
  ];
  const condIds = {};
  for (const [name,name_zh,nat,bio] of conductors) {
    const r = await post('/api/conductors',{name,name_zh,nationality:nat,bio});
    condIds[name] = r.id;
    console.log('Conductor:', r.id, name_zh);
  }

  // 3. Add soloists
  const soloists = [
    ['Daniil Trifonov','丹尼尔·特里弗诺夫','钢琴','俄罗斯','世界顶级钢琴家，格莱美奖得主。'],
    ['Pinchas Zukerman','平查斯·祖克曼','小提琴','以色列','世界著名小提琴家、中提琴家和指挥家。'],
    ['Zeng Yun','曾韵','圆号','中国','柏林爱乐乐团圆号首席，柴可夫斯基大赛冠军。'],
    ['Alexander Malofeev','亚历山大·马洛费耶夫','钢琴','俄罗斯','俄罗斯青年钢琴天才。'],
    ['Wang Yujia','王羽佳','钢琴','中国','世界顶级钢琴家。'],
    ['Martha Argerich','玛塔·阿格里奇','钢琴','阿根廷','钢琴女祭司。'],
    ['Vilde Frang','薇尔德·弗朗','小提琴','挪威','挪威小提琴家。'],
    ['Christian Gerhaher','克里斯蒂安·格哈赫','男中音','德国','德国著名男中音歌唱家。'],
    ['Christian Tetzlaff','克里斯蒂安·特斯拉夫','小提琴','德国','德国小提琴家。'],
    ['Mitsuko Uchida','内田光子','钢琴','日本','世界顶级钢琴家。'],
    ['Leif Ove Andsnes','列夫·奥维·安斯尼斯','钢琴','挪威','挪威钢琴家。'],
    ['Yefim Bronfman','叶菲姆·布朗夫曼','钢琴','以色列裔美国','著名钢琴家。'],
    ['Yunchan Lim','任奫灿','钢琴','韩国','2022年范·克莱本国际钢琴比赛冠军，最年轻的金牌得主。'],
    ['Yo-Yo Ma','马友友','大提琴','美国','华裔大提琴家。'],
    ['Augustin Hadelich','奥古斯丁·哈德利希','小提琴','德国裔美国','小提琴家。'],
    ['Isabelle Faust','伊莎贝尔·福斯特','小提琴','德国','德国小提琴家。'],
  ];
  const soloIds = {};
  for (const [name,name_zh,instr,nat,bio] of soloists) {
    const r = await post('/api/performers',{name,name_zh,instrument:instr,nationality:nat,bio});
    soloIds[name] = r.id;
    console.log('Soloist:', r.id, name_zh);
  }

  // 4. Add venue: Berlin Philharmonie
  const v = await post('/api/venues',{
    name:'Berliner Philharmonie',name_zh:'柏林爱乐大厅',city:'柏林',district:'Tiergarten',
    address:'Herbert-von-Karajan-Straße 1, 10785 Berlin, Germany',
    description:'柏林爱乐乐团驻地，由建筑师汉斯·夏隆设计，1963年启用，以独特的葡萄园式舞台布局和卓越声学效果闻名于世。'
  });
  const venueId = v.id;
  console.log('Venue:', venueId, '柏林爱乐大厅');

  // 5. Mark existing IDs
  const orchBP = 6; // Berlin Philharmonic
  const condRattle = 7;
  const condDudamel = 8;
  const condJarvi = 68; // Paavo Järvi

  // 6. Create performances - key info only, pieces added separately
  const concerts = [
    {t:'乐季开幕音乐会：别特连科演绎埃尔加与柴可夫斯基',st:'2026/27乐季开幕',dt:'2026-08-21T19:00:00',d:'埃尔加《谜语变奏曲》op.36 + 柴可夫斯基《f小调第四交响曲》。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'布雷特·迪恩指挥个人作品',st:'迪恩与德彪西',dt:'2026-09-10T19:00:00',d:'迪恩《与舒曼的对话》《我曾扮演奥菲莉亚》《乞丐与天使》+ 德彪西《沉没的教堂》（科林·马修斯改编）。指挥：布雷特·迪恩。',cid:condIds['Kirill Petrenko']}, // Dean is composer/conductor
    {t:'西蒙·拉特演绎德·法雅、雅纳切克及世界首演',st:'拉特与新音乐',dt:'2026-09-17T19:00:00',d:'德·法雅《人生朝露》+ 米利肯《为何羽毛是黄色的》（世界首演）+ 雅纳切克《塔拉斯·布尔巴》狂想曲。指挥：西蒙·拉特爵士。',cid:condRattle},
    {t:'丹尼尔·哈丁指挥马勒《复活交响曲》',st:'马勒第二交响曲',dt:'2026-09-24T19:00:00',d:'马勒《c小调第二交响曲"复活"》。指挥：丹尼尔·哈丁。',cid:condIds['Daniel Harding']},
    {t:'别特连科与特里弗诺夫演绎勃拉姆斯与施特劳斯',st:'勃拉姆斯第一钢协·查拉图斯特拉',dt:'2026-10-01T19:00:00',d:'勃拉姆斯《d小调第一钢琴协奏曲》op.15（独奏：丹尼尔·特里弗诺夫）+ 理查·施特劳斯《查拉图斯特拉如是说》op.30。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'伊万·费舍尔指挥马勒第五交响曲',st:'海顿与马勒',dt:'2026-11-05T19:00:00',d:'海顿《降B大调交响协奏曲》Hob.I:105 + 马勒《第五交响曲》。指挥：伊万·费舍尔。',cid:condIds['Ivan Fischer']},
    {t:'祖宾·梅塔与平查斯·祖克曼',st:'梅塔×祖克曼：布鲁赫与德沃夏克',dt:'2026-11-12T19:00:00',d:'莫扎特《费加罗的婚礼》序曲 + 布鲁赫《g小调第一小提琴协奏曲》op.26（独奏：平查斯·祖克曼）+ 德沃夏克《d小调第七交响曲》op.70。指挥：祖宾·梅塔。',cid:condIds['Zubin Mehta']},
    {t:'埃梅里亚尼切夫指挥门德尔松、莫扎特与海顿',st:'曾韵：莫扎特圆号协奏曲',dt:'2026-11-19T19:00:00',d:'门德尔松《平静的海和幸福的航行》序曲 + 莫扎特《降E大调第四圆号协奏曲》KV495（独奏：曾韵）+ 海顿《D大调第十一钢琴协奏曲》《第104交响曲》。指挥：马克西姆·埃梅里亚尼切夫。',cid:condIds['Maxim Emelyanychev']},
    {t:'别特连科指挥雷斯庇基与马图奇',st:'罗马三部曲',dt:'2026-11-26T19:00:00',d:'马图奇《降G大调夜曲》op.70 no.1（管弦乐版）+ 雷斯庇基《罗马的节日》《罗马的松树》《罗马的喷泉》。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'马雷克·亚诺夫斯基演绎布鲁克纳第八交响曲',st:'布鲁克纳第八',dt:'2026-12-10T19:00:00',d:'布鲁克纳《c小调第八交响曲》（1890年第二版）。指挥：马雷克·亚诺夫斯基。',cid:condIds['Marek Janowski']},
    {t:'马克西姆·帕斯卡尔首次亮相指挥柏辽兹《基督的童年》',st:'柏辽兹清唱剧',dt:'2026-12-17T19:00:00',d:'柏辽兹《基督的童年》清唱剧 op.25。指挥：马克西姆·帕斯卡尔。',cid:condIds['Maxime Pascal']},
    {t:'2026除夕音乐会：别特连科与马洛费耶夫',st:'除夕音乐会',dt:'2026-12-29T19:00:00',d:'尼科莱《温莎的风流娘儿们》序曲 + 肖斯塔科维奇《c小调钢琴、小号与弦乐协奏曲》op.35（独奏：马洛费耶夫）+ 普罗科菲耶夫《D大调第一交响曲"古典"》+ 理查·施特劳斯《蒂尔的恶作剧》+ 约翰·施特劳斯《吉普赛男爵》序曲。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'雅各布·赫卢萨与王羽佳',st:'王羽佳：巴托克第一钢协',dt:'2027-01-07T19:00:00',d:'德沃夏克《B大调弦乐夜曲》op.40 + 巴托克《第一钢琴协奏曲》Sz.83（独奏：王羽佳）+ 勃拉姆斯《D大调第一小夜曲》op.11。指挥：雅各布·赫卢萨。',cid:condIds['Jakub Hrůša']},
    {t:'别特连科演绎梅西安、欣德米特及世界首演',st:'现代经典',dt:'2027-01-14T19:00:00',d:'梅西安《被遗忘的祭品》冥想交响曲 + 内姆佐夫《面孔》（世界首演，柏林爱乐委约）+ 欣德米特《画家马蒂斯》交响曲。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'弗朗索瓦-萨维埃·罗特演绎施特劳斯、柏辽兹与布朗热',st:'法国之夜',dt:'2027-01-21T19:00:00',d:'理查·施特劳斯《变形》为23件弦乐而作 + 柏辽兹《罗密欧与朱丽叶》选段 + 莉莉·布朗热《浮士德与海伦》。指挥：弗朗索瓦-萨维埃·罗特。',cid:condIds['François-Xavier Roth']},
    {t:'别特连科指挥贝多芬《庄严弥撒》',st:'贝多芬庄严弥撒',dt:'2027-01-28T19:00:00',d:'贝多芬《D大调庄严弥撒》op.123。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'萨卡里·奥拉莫与薇尔德·弗朗',st:'布里顿小提琴协奏曲',dt:'2027-02-11T19:00:00',d:'迪恩《幻影——管弦乐场景》（世界首演，柏林爱乐委约）+ 布里顿《小提琴协奏曲》op.15（独奏：薇尔德·弗朗）+ 西贝柳斯《降E大调第五交响曲》op.82。指挥：萨卡里·奥拉莫。',cid:condIds['Sakari Oramo']},
    {t:'马库斯·波什纳与克里斯蒂安·格哈赫',st:'晚期浪漫',dt:'2027-02-18T19:00:00',d:'马勒《大地之歌》选段 + 迪彭布罗克《在伟大的沉默中》+ 舒伯特《C大调第八交响曲"伟大"》D944。指挥：马库斯·波什纳，男中音：克里斯蒂安·格哈赫。',cid:condIds['Markus Poschner']},
    {t:'拉哈夫·沙尼与玛塔·阿格里奇',st:'阿格里奇：普罗科菲耶夫第三钢协',dt:'2027-02-25T19:00:00',d:'德彪西《牧神午后前奏曲》+ 普罗科菲耶夫《C大调第三钢琴协奏曲》op.26（独奏：阿格里奇）+ 穆索尔斯基《图画展览会》（拉威尔配器）。指挥：拉哈夫·沙尼。',cid:condIds['Lahav Shani']},
    {t:'别特连科演绎瓦格纳《女武神》（音乐会版）',st:'瓦格纳：女武神',dt:'2027-04-03T19:00:00',d:'瓦格纳《女武神》全剧（音乐会版）。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'帕沃·雅尔维与克里斯蒂安·特斯拉夫',st:'肖斯塔科维奇第二小提琴协奏曲',dt:'2027-04-08T19:00:00',d:'帕特《剪影》+ 肖斯塔科维奇《升c小调第二小提琴协奏曲》op.129（独奏：克里斯蒂安·特斯拉夫）+ 普罗科菲耶夫《降B大调第五交响曲》op.100。指挥：帕沃·雅尔维。',cid:condJarvi},
    {t:'古斯塔沃·杜达梅尔指挥马勒第七交响曲',st:'马勒第七',dt:'2027-04-15T19:00:00',d:'马勒《第七交响曲》。指挥：古斯塔沃·杜达梅尔。',cid:condDudamel},
    {t:'杜达梅尔与内田光子',st:'内田光子：贝多芬第二钢协',dt:'2027-04-22T19:00:00',d:'贝多芬《降B大调第二钢琴协奏曲》op.19（独奏：内田光子）+ 布鲁克纳《降E大调第四交响曲"浪漫"》（1878-1880年第二版）。指挥：古斯塔沃·杜达梅尔。',cid:condDudamel},
    {t:'别特连科与安斯尼斯',st:'格里格钢琴协奏曲·贝多芬田园',dt:'2027-04-28T19:00:00',d:'门德尔松《赫布底里群岛》序曲 + 格里格《a小调钢琴协奏曲》op.16（独奏：安斯尼斯）+ 贝多芬《F大调第六交响曲"田园"》op.68。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'图甘·索基耶夫与布朗夫曼',st:'肖斯塔科维奇第十二',dt:'2027-05-13T19:00:00',d:'布里顿《简易交响曲》op.4 + 莫扎特《c小调钢琴协奏曲》KV491（独奏：布朗夫曼）+ 肖斯塔科维奇《d小调第十二交响曲"1917年"》op.112。指挥：图甘·索基耶夫。',cid:condIds['Tugan Sokhiev']},
    {t:'克劳斯·麦凯莱与任奫灿',st:'任奫灿：拉赫玛尼诺夫第四钢协',dt:'2027-05-20T19:00:00',d:'拉切新作品（德国首演，四大乐团联合委约）+ 拉赫玛尼诺夫《g小调第四钢琴协奏曲》op.40（独奏：任奫灿）+ 西贝柳斯《C大调第七交响曲》op.105。指挥：克劳斯·麦凯莱。',cid:condIds['Klaus Mäkelä']},
    {t:'别特连科指挥洪佩尔丁克《糖果屋》',st:'歌剧：糖果屋',dt:'2027-05-27T19:00:00',d:'洪佩尔丁克《糖果屋》（音乐会版歌剧）。指挥：基里尔·别特连科。',cid:condIds['Kirill Petrenko']},
    {t:'斯洛伯登尼乌克与马友友',st:'马友友：舒曼大提琴协奏曲',dt:'2027-06-03T19:00:00',d:'迪恩《回忆：挂坠盒》+ 舒曼《a小调大提琴协奏曲》op.129（独奏：马友友）+ 门德尔松《仲夏夜之梦》op.61选段。指挥：蒂玛·斯洛伯登尼乌克。',cid:condIds['Dima Slobodeniouk']},
    {t:'陈以琳与赵成珍',st:'赵成珍：普罗科菲耶夫第二钢协',dt:'2027-06-10T19:00:00',d:'古拜杜林娜《童话诗》+ 普罗科菲耶夫《g小调第二钢琴协奏曲》op.16（独奏：赵成珍）+ 卢托斯拉夫斯基《乐队协奏曲》。指挥：陈以琳。',cid:condIds['Elim Chan']},
    {t:'艾伦·吉尔伯特与伊莎贝尔·福斯特',st:'舒曼第二交响曲',dt:'2027-06-17T19:00:00',d:'迪恩《失传的书信艺术》小提琴与乐队（独奏：伊莎贝尔·福斯特）+ 舒曼《C大调第二交响曲》op.61。指挥：艾伦·吉尔伯特。',cid:condIds['Alan Gilbert']},
    {t:'2027森林剧场音乐节：哈丁与哈德利希',st:'森林剧场露天音乐会',dt:'2027-06-26T20:00:00',d:'约翰·施特劳斯《蝙蝠》序曲、《艺术家的生涯》圆舞曲、《帕斯曼骑士》查尔达什 + 拉威尔《圆舞曲》《茨冈》（独奏：哈德利希）+ 萨拉萨蒂《卡门幻想曲》op.25 + 理查·施特劳斯《七面纱舞》+ 斯特拉文斯基《火鸟》组曲（1919年版）。指挥：丹尼尔·哈丁。',cid:condIds['Daniel Harding']},
  ];

  const src = '柏林爱乐中国官方微信公众号 2026/27乐季';
  const srcUrl = 'https://mp.weixin.qq.com/s/J-fOBnR1QVUA5RPOLJSa1A';
  for (const c of concerts) {
    const r = await post('/api/performances',{
      title:c.t, subtitle:c.st, date_time:c.dt, venue_id:venueId,
      orchestra_id:orchBP, conductor_id:c.cid, description:c.d,
      source:src, source_url:srcUrl, status:'published', source_verified:true
    });
    console.log('Created ID', r.id, '-', c.t.substring(0,60));
  }
  console.log('\nDone! Created', concerts.length, 'concerts total.');
}

main();

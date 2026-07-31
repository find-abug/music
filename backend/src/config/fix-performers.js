/**
 * 修复演奏家关联 v2 — 更精确的名字提取
 */
const {
  Performance, Performer, PerformancePerformer,
} = require('../models/associations');

// 角色→乐器映射
const ROLE_MAP = {
  '钢琴': '钢琴', '小提琴': '小提琴', '中提琴': '中提琴', '大提琴': '大提琴',
  '双簧管': '双簧管', '单簧管': '单簧管', '长笛': '长笛', '圆号': '圆号',
  '小号': '小号', '长号': '长号', '大管': '大管', '竖琴': '竖琴',
  '管风琴': '管风琴', '笙': '笙', '口琴': '口琴',
  '女高音': '女高音', '女中音': '女中音', '男高音': '男高音',
  '男中音': '男中音', '男低音': '男低音', '声乐': '声乐',
  '独奏': '', '独唱': '', '演奏': '',
};

const SKIP = new Set([
  '香港管弦乐团','广州交响乐团','深圳交响乐团','港乐','广交','深交',
  '港乐合唱团','香港儿童合唱团','伦敦爱乐合唱团','台北爱乐合唱团',
  '上海四重奏','中国圆号重奏团','白手合唱团','西蒙·玻利瓦尔交响乐团',
  '俄罗斯音乐永恒男声合唱团','港大室内合唱团',
  '---',
]);

function extractNames(text) {
  // 从 "钢琴：张昊辰" 这类模式中提取演奏家名字
  const results = [];
  for (const [role, inst] of Object.entries(ROLE_MAP)) {
    // 匹配：角色：名字（名字在分号、换行、或下一个角色关键词之前结束）
    const pattern = new RegExp(
      `${role}[：:]\\s*([^；;\\n\\r]+?)(?:\\s*[；;\\n\\r]|\\s*$|\\s*(?:${Object.keys(ROLE_MAP).join('|')}))`,
      'g'
    );
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const raw = m[1].trim();
      // 只取名字部分（去掉可能粘在后面的曲目等信息）
      // 名字通常是：中文字符 或 Latin字母+空格+点
      const nameMatch = raw.match(/^[一-鿿·㐀-䶿]{2,4}|^[A-Za-zÀ-ÖØ-öø-ÿ\s.·\-]{3,30}/);
      if (!nameMatch) continue;
      const name = nameMatch[0].trim();
      if (name && name.length >= 2 && !SKIP.has(name)) {
        results.push({ name, instrument: inst, role });
      }
    }
  }
  return results;
}

async function main() {
  // 先清空所有通过上次修复创建的演奏家关联（保留手动的）
  console.log('清理旧关联...');
  await PerformancePerformer.destroy({ where: {}, truncate: false });
  console.log('已清空');

  const allPerfs = await Performance.findAll({ order: [['id', 'ASC']] });
  let linked = 0;
  let noMatch = 0;

  console.log(`\n扫描 ${allPerfs.length} 场演出...\n`);

  for (const perf of allPerfs) {
    const text = (perf.description || '') + '\n' + (perf.program_notes || '');
    const found = extractNames(text);
    if (found.length === 0) { noMatch++; continue; }

    // 去重（同一个人可能同时出现多个角色）
    const unique = [];
    const seen = new Set();
    for (const f of found) {
      if (!seen.has(f.name)) { seen.add(f.name); unique.push(f); }
    }

    for (const f of unique) {
      let [performer] = await Performer.findOrCreate({
        where: { name_zh: f.name },
        defaults: { name: f.name, name_zh: f.name, instrument: f.instrument },
      });
      if (f.instrument && !performer.instrument) {
        await performer.update({ instrument: f.instrument });
      }
      await PerformancePerformer.create({
        performance_id: perf.id, performer_id: performer.id,
        role: f.role, instrument: f.instrument,
      });
      linked++;
    }
  }

  const totalPP = await PerformancePerformer.count();
  const withP = await Performance.count({
    include: [{ model: PerformancePerformer, as: 'performancePerformers', required: true }],
    distinct: true,
  });

  console.log(`新建关联: ${linked} 条 | 总关联: ${totalPP} | 含演奏家演出: ${withP}/${allPerfs.length}`);

  // 验证
  const names = ['张昊辰', '王健', '郎朗', '马友友', '宁峰', '曾韵', '王羽佳'];
  for (const n of names) {
    const perf = await Performer.findOne({ where: { name_zh: n } });
    if (!perf) { console.log(`  ${n}: 不存在`); continue; }
    const count = await PerformancePerformer.count({ where: { performer_id: perf.id } });
    console.log(`  ${n}: ${count} 场`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

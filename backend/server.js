require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const sequelize = require('./src/config/database');

// 导入路由
const performanceRoutes = require('./src/routes/performances');
const composerRoutes = require('./src/routes/composers');
const conductorRoutes = require('./src/routes/conductors');
const performerRoutes = require('./src/routes/performers');
const orchestraRoutes = require('./src/routes/orchestras');
const venueRoutes = require('./src/routes/venues');
const searchRoutes = require('./src/routes/search');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ 中间件 ============
// helmet 配置：允许网页内联脚本和样式运行
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接状态
let dbConnected = false;

// ============ API 路由 ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/performances', performanceRoutes);
app.use('/api/composers', composerRoutes);
app.use('/api/conductors', conductorRoutes);
app.use('/api/performers', performerRoutes);
app.use('/api/orchestras', orchestraRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// ============ 静态文件 & 管理后台 ============
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============ 404 处理 ============
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// ============ 错误处理 ============
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============ 启动服务 ============
async function initDatabase() {
  // 检查数据库是否需要初始化（表为空时从 seed.json 恢复）
  const seedFile = path.join(__dirname, 'data', 'seed.json');
  if (!fs.existsSync(seedFile)) {
    console.log('  未找到 seed.json，跳过数据初始化');
    return;
  }

  // 确保表结构存在
  await sequelize.sync();

  // 检查是否已有数据
  const { Performance } = require('./src/models/associations');
  const count = await Performance.count();
  if (count > 0) {
    console.log(`  数据库已有 ${count} 场演出，跳过初始化`);
    return;
  }

  console.log('📦 首次启动，正在导入种子数据...');
  const {
    Composer, Conductor, Performer, Orchestra, Venue,
    PerformancePiece, PerformancePerformer,
  } = require('./src/models/associations');

  const dump = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

  // 按依赖顺序导入
  await Composer.bulkCreate(dump.composers || [], { ignoreDuplicates: true });
  await Conductor.bulkCreate(dump.conductors || [], { ignoreDuplicates: true });
  await Performer.bulkCreate(dump.performers || [], { ignoreDuplicates: true });
  await Orchestra.bulkCreate(dump.orchestras || [], { ignoreDuplicates: true });
  await Venue.bulkCreate(dump.venues || [], { ignoreDuplicates: true });
  await Performance.bulkCreate(dump.performances || [], { ignoreDuplicates: true });
  await PerformancePiece.bulkCreate(dump.performance_pieces || [], { ignoreDuplicates: true });
  await PerformancePerformer.bulkCreate(dump.performance_performers || [], { ignoreDuplicates: true });

  console.log('✅ 种子数据导入完成');
}

async function startServer() {
  try {
    await sequelize.authenticate();
    dbConnected = true;
    console.log('✅ 数据库连接成功');

    // 自动初始化数据
    await initDatabase();
  } catch (error) {
    console.error('⚠️  数据库连接失败:', error.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('🎵 古典音乐演出网站已启动: http://localhost:' + PORT);
    if (!dbConnected) {
      console.log('💡 提示: 数据库未连接，静态页面可正常访问，搜索/API功能暂不可用');
    }
  });
}

startServer();

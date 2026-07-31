# 🎵 古典音乐演出排期 — 微信小程序

汇总各大音乐厅和乐团的古典音乐演出信息，支持按**作曲家、指挥家、演奏家、乐团、演出场所**进行多维度查询。

## 项目结构

```
classical-music/
├── miniprogram/          # 微信小程序前端（原生框架）
│   ├── pages/
│   │   ├── index/        # 首页 — 演出列表
│   │   ├── search/       # 搜索页 — 五维度筛选
│   │   ├── detail/       # 演出详情页
│   │   └── about/        # 关于页
│   ├── components/       # 组件
│   └── utils/            # 工具函数 + API 封装
├── backend/              # Node.js 后端 API
│   ├── src/
│   │   ├── routes/       # 路由
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # Sequelize 数据模型
│   │   └── config/       # 配置
│   ├── public/           # 管理后台页面
│   └── server.js         # 入口文件
├── crawler/              # Python 爬虫模块
│   ├── scrapers/         # 各站点爬虫
│   ├── scheduler.py      # 定时调度器
│   └── config.py         # 爬虫配置
└── database/
    └── schema.sql         # 数据库建表 + 种子数据
```

## 快速开始

### 前置条件
- Node.js 18+
- MySQL 8.0+
- Python 3.9+ (爬虫模块)
- 微信开发者工具
- 微信小程序 AppID（注册地址：https://mp.weixin.qq.com/）

### 1. 数据库初始化

```bash
# 创建数据库并导入基础数据
mysql -u root -p < database/schema.sql
```

### 2. 启动后端 API

```bash
cd backend
npm install

# 修改 .env 中的数据库连接信息
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=classical_music
# DB_USER=root
# DB_PASSWORD=your_password

# 启动服务（开发模式）
npm run dev

# 访问管理后台
# http://localhost:3000/admin

# 插入示例演出数据
npm run db:seed
```

### 3. 微信小程序配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 用微信开发者工具打开 `miniprogram/` 目录
3. 修改 `project.config.json` 中的 `appid` 为你的 AppID
4. 修改 `app.js` 中的 `apiBaseUrl` 为你的后端地址
5. 在微信公众平台后台配置 request 合法域名

### 4. 启动爬虫（可选）

```bash
cd crawler
pip install -r requirements.txt

# 手动运行单个爬虫测试
python scheduler.py chncpa

# 启动定时调度（每日凌晨2点自动爬取）
python scheduler.py
```

## API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/performances` | GET | 演出列表（支持多条件筛选） |
| `/api/performances/:id` | GET | 演出详情 |
| `/api/composers` | GET | 作曲家列表 |
| `/api/conductors` | GET | 指挥家列表 |
| `/api/performers` | GET | 演奏家列表 |
| `/api/orchestras` | GET | 乐团列表 |
| `/api/venues` | GET | 演出场所列表 |
| `/api/search?q=` | GET | 全文搜索 |
| `/api/admin/stats` | GET | 数据统计 |

### 筛选参数示例

```
GET /api/performances?composer_id=1&orchestra_id=2&city=北京&date_from=2026-07-01&date_to=2026-12-31
```

## 数据源

爬虫模块支持以下站点（可根据需要扩展）：

- 🏛️ 国家大剧院 (chncpa.org)
- 🎻 上海交响乐团音乐厅 (shsymphony.com)
- 🎹 星海音乐厅 (concerthall.com.cn)

新增爬虫只需继承 `BaseScraper` 类并实现 `scrape()` 方法。

## 部署上线

### 推荐方案：微信云托管

1. 在微信公众平台开通云托管
2. 将 `backend/` 目录部署为云托管服务
3. 配置环境变量（数据库连接等）
4. 小程序配置云托管域名

### 备选方案：腾讯云轻量应用服务器

1. 购买轻量应用服务器（建议 2核4G）
2. 安装 Node.js + MySQL
3. 部署后端代码并使用 PM2 守护进程
4. 配置 Nginx 反向代理 + HTTPS
5. 域名备案（ICP）

## 网站部署（Railway）

线上分享地址：https://classical-music-production.up.railway.app

仓库：[find-abug/music](https://github.com/find-abug/music) 的 `backend/` 部署在 [Railway](https://railway.com)。  
线上使用 Postgres（`DATABASE_URL`）；本地开发仍默认 SQLite（`backend/data/classical_music.db`）。

### 更新线上数据

1. 本地启动：`cd backend && npm run dev`
2. 用 http://localhost:3000/admin 修改数据（写入本地 SQLite）
3. 若需同步到线上 Postgres：导出/重新导入种子，或在本地改完后更新 `backend/data/seed.json` 并重新部署（首次启动会在空库时从 `seed.json` 导入）
4. 推送代码触发 Railway 自动部署：

```bash
git add -A
git commit -m "data: update performances"
git push
```

### 部署注意

- Root Directory 必须为 `backend`
- 环境变量：`NODE_ENV=production`，以及指向 Postgres 的 `DATABASE_URL`
- Railway 试用额度有限（控制台可见剩余天数/金额）

## 注意事项

- 微信小程序包体积限制 2MB
- 小程序必须使用 HTTPS 接口
- 爬虫请遵守目标网站 robots.txt
- 演出信息仅展示公开可获取的内容
- 标注信息来源，尊重版权

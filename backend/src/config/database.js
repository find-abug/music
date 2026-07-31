const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// 使用 SQLite — 零配置，数据文件直接存在项目目录
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'classical_music.db');

// 确保 data 目录存在
const fs = require('fs');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // SQLite 日志太吵，关掉
  define: {
    timestamps: false,
    underscored: true,
  },
});

module.exports = sequelize;

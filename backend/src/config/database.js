const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const define = {
  timestamps: false,
  underscored: true,
};

function createSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DATABASE_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      define,
    });
  }

  // Local / default: SQLite file in project data directory
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'classical_music.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define,
  });
}

module.exports = createSequelize();

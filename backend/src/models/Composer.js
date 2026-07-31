const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Composer = sequelize.define('Composer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '外文名',
  },
  name_zh: {
    type: DataTypes.STRING(255),
    comment: '中文译名',
  },
  birth_year: {
    type: DataTypes.INTEGER,
    comment: '出生年份',
  },
  death_year: {
    type: DataTypes.INTEGER,
    comment: '逝世年份',
  },
  era: {
    type: DataTypes.STRING(50),
    comment: '时期',
  },
  description: {
    type: DataTypes.TEXT,
    comment: '简介',
  },
}, {
  tableName: 'composers',
  timestamps: true,
  underscored: true,
});

module.exports = Composer;

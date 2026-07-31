const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Performance = sequelize.define('Performance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '演出名称',
  },
  subtitle: {
    type: DataTypes.STRING(500),
    comment: '副标题',
  },
  description: {
    type: DataTypes.TEXT,
    comment: '演出介绍',
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '演出日期时间',
  },
  end_time: {
    type: DataTypes.DATE,
    comment: '预计结束时间',
  },
  venue_id: {
    type: DataTypes.INTEGER,
  },
  orchestra_id: {
    type: DataTypes.INTEGER,
  },
  conductor_id: {
    type: DataTypes.INTEGER,
  },
  poster_url: {
    type: DataTypes.STRING(500),
  },
  ticket_url: {
    type: DataTypes.STRING(500),
  },
  program_notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
    validate: { isIn: [['draft', 'published', 'cancelled', 'past']] },
  },
  source: {
    type: DataTypes.STRING(255),
    comment: '信息来源',
  },
  source_url: {
    type: DataTypes.STRING(500),
    comment: '来源URL',
  },
  source_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否审核',
  },
}, {
  tableName: 'performances',
  timestamps: true,
  underscored: true,
});

module.exports = Performance;

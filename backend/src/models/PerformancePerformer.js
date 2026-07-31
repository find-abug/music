const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerformancePerformer = sequelize.define('PerformancePerformer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  performance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  performer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(100),
    comment: '角色',
  },
  instrument: {
    type: DataTypes.STRING(100),
    comment: '本场演奏乐器',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'performance_performers',
  timestamps: false,
  underscored: true,
});

module.exports = PerformancePerformer;

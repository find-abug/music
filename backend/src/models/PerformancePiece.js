const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerformancePiece = sequelize.define('PerformancePiece', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  performance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  composer_id: {
    type: DataTypes.INTEGER,
  },
  piece_name: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '曲目名称',
  },
  piece_name_zh: {
    type: DataTypes.STRING(500),
    comment: '曲目中文名',
  },
  opus_number: {
    type: DataTypes.STRING(100),
    comment: '作品号',
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序',
  },
  notes: {
    type: DataTypes.TEXT,
    comment: '备注',
  },
}, {
  tableName: 'performance_pieces',
  timestamps: false,
  underscored: true,
});

module.exports = PerformancePiece;

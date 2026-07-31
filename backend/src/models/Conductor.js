const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conductor = sequelize.define('Conductor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name_zh: {
    type: DataTypes.STRING(255),
  },
  nationality: {
    type: DataTypes.STRING(100),
  },
  bio: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'conductors',
  timestamps: true,
  underscored: true,
});

module.exports = Conductor;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Orchestra = sequelize.define('Orchestra', {
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
  country: {
    type: DataTypes.STRING(100),
  },
  city: {
    type: DataTypes.STRING(100),
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'orchestras',
  timestamps: true,
  underscored: true,
});

module.exports = Orchestra;

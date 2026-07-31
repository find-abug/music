const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venue = sequelize.define('Venue', {
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
  city: {
    type: DataTypes.STRING(100),
  },
  district: {
    type: DataTypes.STRING(100),
  },
  address: {
    type: DataTypes.TEXT,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'venues',
  timestamps: true,
  underscored: true,
});

module.exports = Venue;

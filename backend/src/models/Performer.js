const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Performer = sequelize.define('Performer', {
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
  instrument: {
    type: DataTypes.STRING(100),
  },
  nationality: {
    type: DataTypes.STRING(100),
  },
  bio: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'performers',
  timestamps: true,
  underscored: true,
});

module.exports = Performer;

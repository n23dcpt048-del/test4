const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ugc = sequelize.define('Ugc', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'archived'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

module.exports = Ugc;

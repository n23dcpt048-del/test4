const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true }
  },
  fanpage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isUrl: true }
  },
  avatar: {
    type: DataTypes.STRING, // lưu đường dẫn ảnh
    allowNull: false,
    defaultValue: 'https://via.placeholder.com/70x70/007bff/ffffff?text=Org'
  }
}, {
  timestamps: true
});

module.exports = Organization;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }, // ← Cho phép null
  email: { type: DataTypes.STRING, allowNull: true }, // ← Cho phép null
  fanpage: { type: DataTypes.STRING, allowNull: true }, // ← Cho phép null
  avatar: { 
    type: DataTypes.STRING, 
    defaultValue: 'https://via.placeholder.com/70x70/007bff/ffffff?text=Org' 
  }
}, { timestamps: true });

module.exports = Organization;

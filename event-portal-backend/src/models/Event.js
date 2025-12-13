const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  startTime: { 
    type: DataTypes.DATE, 
    allowNull: true   // ← TẠM THỜI CHO PHÉP NULL ĐỂ SYNC THÀNH CÔNG
  },
  endTime: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  registrationDeadline: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  location: { type: DataTypes.STRING, allowNull: false },
  registrationLink: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('created', 'pending', 'approved'),
    defaultValue: 'created'
  },
  channels: { type: DataTypes.JSON, defaultValue: ['web'] },
  organizationId: {
    type: DataTypes.INTEGER,
    references: { model: Organization, key: 'id' }
  }
}, { timestamps: true });

Event.belongsTo(Organization, { foreignKey: 'organizationId' });
Organization.hasMany(Event, { foreignKey: 'organizationId' });

module.exports = Event;

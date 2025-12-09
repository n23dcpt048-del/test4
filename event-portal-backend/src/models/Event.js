
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  registrationDeadline: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  registrationLink: { type: DataTypes.STRING, allowNull: false },
  coverImage: { type: DataTypes.STRING }, // Cloudinary URL
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  status: { 
    type: DataTypes.ENUM('created', 'pending', 'approved', 'rejected'),
    defaultValue: 'created'
  },
  channels: { type: DataTypes.JSON, defaultValue: ['web'] }
}, { timestamps: true });

module.exports = Event;



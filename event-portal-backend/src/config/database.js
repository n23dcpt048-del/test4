const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: process.env.DATABASE_URL.includes('render.com') ? {
    ssl: { rejectUnauthorized: false }
  } : {}
});

module.exports = sequelize;
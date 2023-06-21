const { DataTypes } = require('sequelize')

const db = require('../db/conn')
const Ubs = require('./Ubs')

const Video = db.define('Video', {
  Path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

Ubs.hasMany(Video, {
  foreignKey: 'UbsId'
})

Video.belongsTo(Ubs, {foreignKey : 'UbsId'})

module.exports = Video
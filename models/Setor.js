const { DataTypes } = require('sequelize')

const db = require('../db/conn')

const Ubs = require('./Ubs')

const Setor = db.define('Setor', {
  Nome: {
    type: DataTypes.STRING,
    allowNull: false,
  }
})

Ubs.hasMany(Setor, {
  foreignKey: 'UbsId'
})

Setor.belongsTo(Ubs, {foreignKey : 'UbsId'})

module.exports = Setor
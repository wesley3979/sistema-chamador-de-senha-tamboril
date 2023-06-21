const { DataTypes } = require('sequelize')

const db = require('../db/conn')
const Setor = require('./Setor')
const Ubs = require('./Ubs')

const User = db.define('User', {
  Login: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Salt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  IsMaster: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
})

Setor.hasMany(User, {
  foreignKey: 'SetorId'
})

User.belongsTo(Setor, {foreignKey : 'SetorId'})

module.exports = User
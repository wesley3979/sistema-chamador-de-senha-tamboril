const { DataTypes } = require('sequelize')

const db = require('../db/conn')

const Ubs = db.define('Ubs', {
  Nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports = Ubs
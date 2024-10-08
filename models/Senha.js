const { DataTypes } = require('sequelize')

const db = require('../db/conn')
const Setor = require('./Setor')
const Local = require('./Local')

const Senha = db.define('Senha', {
  Status: {
    type: DataTypes.ENUM('Na fila', 'Chamada', 'Atendido', 'Cancelada'),
    allowNull: false,
  },
  Paciente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Preferencial: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
})

Setor.hasMany(Senha, {
  foreignKey: 'SetorId'
})

Senha.belongsTo(Setor, {foreignKey : 'SetorId'})

Local.hasMany(Senha, {
  foreignKey: "LocalId",
});

module.exports = Senha
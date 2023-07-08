const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const Ubs = require("./Ubs");

const Local = db.define("Local", {
  Nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Ubs.hasMany(Local, {
  foreignKey: "UbsId",
});

Local.belongsTo(Ubs, { foreignKey: "UbsId" });

module.exports = Local;

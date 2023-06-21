const Sequelize = require("sequelize");

const sequelize = new Sequelize('database', 'user','password', {
    dialect: "sqlite",
    host: "./database.sqlite",
    logging: false,
    dialectOptions: {
        useUTC: false
    }
})

try {
  sequelize.authenticate(
    // sequelize.sync({
    //   //force: true,
    //   alter: true
    // })
  )
  console.log("Sequelize connected");
} catch (err) {
  console.log("Não foi possível conectar ao Sequelize: ", error);
}
module.exports = sequelize;
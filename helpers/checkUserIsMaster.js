const User = require("../models/User");

// middleware to validate credentials
const checkUserIsMaster = async (userSCS) => {
  try {
    if (!userSCS)
      return false

    const existsUser = await User.findByPk(userSCS.id);

    if (!existsUser)
        return false

    if (!existsUser.IsMaster)
        return false

    return true
    
  } catch (err) {
    return false
  }
}

module.exports = checkUserIsMaster;
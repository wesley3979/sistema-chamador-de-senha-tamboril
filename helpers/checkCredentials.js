const User = require("../models/User");

// middleware to validate credentials
const checkCredentials = async (req, res, next) => {
  try {
    if (!req.session.userSCS)
      return res.redirect("/user/login");

    const existsUser = await User.findByPk(req.session.userSCS.id);

    if (!existsUser)
      return res.redirect("/user/login");

    if (existsUser.Salt != req.session.userSCS.Salt)
      return res.redirect("/user/login");

    if (existsUser.Hash != req.session.userSCS.Hash)
      return res.redirect("/user/login");

    next();
  } catch (err) {
    res.redirect('/user/login');
  }
};

module.exports = checkCredentials;
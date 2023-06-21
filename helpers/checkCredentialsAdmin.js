require('dotenv').config()

const User = require("../models/User");

// middleware to validate credentials
const checkCredentials = async (req, res, next) => {
  try {
    if (!req.session.admin)
      return res.redirect("/admin/login");

    if (!req.session.admin.login || !req.session.admin.hash || !req.session.admin.salt)
      return res.redirect("/admin/login");
      
    if (process.env.ADMIN_USER != req.session.admin.login)
      return res.redirect("/admin/login");

    if (process.env.ADMIN_SALT != req.session.admin.salt || req.session.admin.hash != process.env.ADMIN_HASH)
      return res.redirect("/admin/login");

    next();
  } catch (err) {
    res.redirect('/admin/login');
  }
};

module.exports = checkCredentials;
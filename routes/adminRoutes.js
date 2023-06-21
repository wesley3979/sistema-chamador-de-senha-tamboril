const { Router } = require("express");
const adminController = require('../controllers/adminController.js');

//MIDDLEWARE
const checkCredentialsAdmin = require('../helpers/checkCredentialsAdmin')

const routes = Router();

routes.get("/login", adminController.loginView);
routes.post("/login", adminController.login);
routes.get("/logout", adminController.logout);
routes.get("/", checkCredentialsAdmin, adminController.homeView);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

const { Router } = require("express");
const userController = require('../controllers/userController.js');

//MIDDLEWARE
const checkCredentials = require('../helpers/checkCredentials')
const checkCredentialsAdmin = require('../helpers/checkCredentialsAdmin')

const routes = Router();

routes.get("/logout", userController.logout);
routes.get("/getMyUserById", checkCredentials, userController.getMyUserById);
routes.get("/getUserById/:id", checkCredentialsAdmin, userController.getUserById);
routes.post("/regeneratePassword/:id", checkCredentialsAdmin, userController.regeneratePassword);
routes.get("/getUsers", checkCredentialsAdmin, userController.getUsers);
routes.post("/insert", checkCredentialsAdmin, userController.insert);
routes.delete("/remove/:id", checkCredentialsAdmin, userController.remove);
routes.put("/update", checkCredentialsAdmin, userController.update);
routes.post("/changeMyPassword", checkCredentials, userController.changeMyPassword);
routes.put("/myUpdate", checkCredentials, userController.update);
routes.get("/login", userController.viewLogin);
routes.post("/login", userController.login);
routes.get("/", checkCredentials, userController.viewHome);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

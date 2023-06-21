const { Router } = require("express");
const setorController = require('../controllers/setorController.js');

//MIDDLEWARE
const checkCredentials = require('../helpers/checkCredentials')
const checkCredentialsAdmin = require('../helpers/checkCredentialsAdmin')

const routes = Router();

routes.get("/getSetores", setorController.getSetores);
routes.post("/insert", checkCredentialsAdmin, setorController.insert);
routes.delete("/remove/:id", checkCredentialsAdmin, setorController.remove);
routes.put("/update", checkCredentialsAdmin, setorController.update);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});   

module.exports = routes;

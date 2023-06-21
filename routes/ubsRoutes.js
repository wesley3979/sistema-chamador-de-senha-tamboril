const { Router } = require("express");
const ubsController = require('../controllers/ubsController.js');

//MIDDLEWARE
const checkCredentialsAdmin = require('../helpers/checkCredentialsAdmin')

const routes = Router();

routes.get("/getAll", ubsController.getAll);
routes.post("/insert", checkCredentialsAdmin, ubsController.insert);
routes.delete("/remove/:id", checkCredentialsAdmin, ubsController.remove);
routes.put("/update", checkCredentialsAdmin, ubsController.update);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

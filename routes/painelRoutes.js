const { Router } = require("express");
const painelController = require('../controllers/painelController.js');

const routes = Router();

routes.get("/painelsecreteriadesaude", painelController.painelsecreteriadesaudeView);
routes.get("/getSenhasCompletedToday", painelController.getSenhasCompletedToday);
routes.get("/:id", painelController.painelView);
routes.get("/", painelController.painelHomeView);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

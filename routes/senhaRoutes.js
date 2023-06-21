const { Router } = require("express");
const senhaController = require('../controllers/senhaController.js');

//MIDDLEWARE
const checkCredentials = require('../helpers/checkCredentials')

const routes = Router();

routes.post("/insert", checkCredentials, senhaController.insert);
routes.put("/cancel", checkCredentials, senhaController.cancel);
routes.get("/getSenhasAtivas", checkCredentials,  senhaController.getSenhasAtivas);
routes.get("/getSenhasPorSessaoAtivas", checkCredentials,  senhaController.getSenhasPorSessaoAtivas);
routes.get("/getSenhasChamadas", senhaController.getSenhasChamadas);
routes.post("/encerrarSenha/:id", senhaController.encerrarSenha);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

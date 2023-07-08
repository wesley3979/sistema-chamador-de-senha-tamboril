const { Router } = require("express");
const localController = require("../controllers/localController.js");

//MIDDLEWARE
const checkCredentialsAdmin = require("../helpers/checkCredentialsAdmin");

const routes = Router();

routes.get("/getAllLocals", localController.getAllLocals);
routes.get("/getLocalsFromUbs", localController.getLocalsFromUbsId);
routes.post("/insert", checkCredentialsAdmin, localController.insert);
routes.delete("/remove/:id", checkCredentialsAdmin, localController.remove);
routes.put("/update", checkCredentialsAdmin, localController.update);

routes.get("*", function (req, res) {
  res.render("notFoundPage");
});

module.exports = routes;

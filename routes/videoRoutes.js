const { Router } = require("express");
const routes = Router();

//controllers
const videoController = require('../controllers/videoController.js');

//MIDDLEWARE
const checkCredentialsAdmin = require('../helpers/checkCredentialsAdmin')

//UPLOAD FILES
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "video/mp4"
  )
    cb(null, true);
  else 
    cb(null, false);
};

const upload = multer({storage: storage, limits: { fileSize: 1024 * 1024 * 250 /*limit 250mb*/ }, fileFilter: fileFilter,});

routes.get("/getAll", checkCredentialsAdmin, videoController.getAll);
routes.post("/insert", checkCredentialsAdmin, upload.single("videoFile"), videoController.insert);
routes.delete("/remove/:id", checkCredentialsAdmin, videoController.remove);

routes.get('*', function(req, res){
    res.render("notFoundPage");    
});  

module.exports = routes;

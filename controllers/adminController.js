require('dotenv').config()

const Auth = require("../helpers/auth");

//MODELS
//const Ubs = require("../models/Ubs");

class AdminController {
    async loginView(req, res){
        res.render("admin/loginPage");    
    }
j
    async login(req, res){
        const { login, password } = req.body;
  
        if (!login)
          return res.status(200).json({ status: "false", message: "O campo Usuário é obrigatório" })

        if (!password)
          return res.status(200).json({ status: "false", message: "O Senha é obrigatório" })

        if (process.env.ADMIN_USER != login)
            return res.status(200).json({ status: "false", message: "O Usuário informado está incorreto" })

        if (!Auth.login(password, process.env.ADMIN_SALT, process.env.ADMIN_HASH))
            return res.status(200).json({ status: "false", message: "Senha incorreta" })

        //set cookies
        req.session.admin = {
            login: login,
            hash: process.env.ADMIN_HASH,
            salt: process.env.ADMIN_SALT
        }; 

        return res.status(200).json({ status: "success", message: "Usuário autorizado" })
    }

    async homeView(req, res){
        res.render("admin/homePage");    
    }

    async logout(req, res){
        if(req.session.admin)
            req.session.admin = null

        return res.redirect("/admin/login")
    }
}

module.exports = new AdminController

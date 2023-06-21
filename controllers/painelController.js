//MODELS
const Ubs = require("../models/Ubs");
const Video = require("../models/Video");
const Senha = require("../models/Senha");
const Setor = require("../models/Setor");

const { Op } = require("sequelize");
const { raw } = require("body-parser");

class PainelController {
    async painelView(req, res){
        const ubs = await Ubs.findByPk(req.params.id)
        
        if(ubs){
            const videos = await Video.findAll({ where: { UbsId: ubs.id}})
            
            res.render("painel/painelPage", { videos });  
        }
        else
            res.redirect("/")  
    }

    async painelHomeView(req, res){
        const ubs = await Ubs.findAll()
        res.render("painel/painelHomePage", { ubs });  
    }

    async painelsecreteriadesaudeView(req, res){
        return res.render("painel/painelSecretariaPage");
    }

    async getSenhasCompletedToday(req, res){
        try{
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            
            const senhas = await Senha.findAll({
                where: {
                    status: 3,
                    updatedAt: {
                        [Op.gte]: date,
                    }
                },
                include: [
                    {
                      model: Setor,
                      include: [
                        {
                          model: Ubs,
                        },
                      ],
                    },
                ],
            })

            return res.status(200).json({ status: "success", message: "Método executado com sucesso", senhas })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

module.exports = new PainelController

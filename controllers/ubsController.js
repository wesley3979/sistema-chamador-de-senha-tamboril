//MODELS
const Ubs = require("../models/Ubs");
const Setor = require("../models/Setor");
const { Op } = require("sequelize")

class SetorController {
    async insert(req, res){
        try{
            const { name } = req.body;
            
            if(!name)
                return res.status(200).json({ status: "false", message: "O nome é obrigatório" })
    
            const existsUbs = await Ubs.findOne({where: {Nome: name} })

            if(existsUbs)
                return res.status(200).json({ status: "false", message: "Já existe uma UBS cadastrada com esse nome" })
    
            const newUbs = {
                Nome: name
            };

            await Ubs.create(newUbs)
    
            return res.status(200).json({ status: "success", message: "Unidade Básica de Saúde cadastrada" })
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async remove(req, res){
        try{
            if(!req.params.id)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o item, tente novamente em instantes." })
        
            const existsUbs = await Ubs.findByPk(req.params.id)
        
            if(!existsUbs)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o item, tente novamente em instantes." })

            const setor = await Setor.findOne({ where: { UbsId: existsUbs.id } } )

            if(setor)
                return res.status(200).json({ status: "false", message: "Não foi possível remover a UBS, pois existem setores cadastrados nela, remova primeiro os setores desta UBS." })

            await existsUbs.destroy()   
        
            return res.status(200).json({ status: "success", message: "Unidade Básica de Saúde removida" })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async update(req, res){
        try{
            const { ubsId, name } = req.body;
                
            if(!ubsId || !name)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o item, tente novamente em instantes" })

            let ubs = await Ubs.findByPk(ubsId)
        
            if(!ubs)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o item, tente novamente em instantes" })

            const existsUbs = await Ubs.findOne( {where: {
                Nome: name, 
                id: {
                    [Op.not]: ubs.id
                } 
            }})
            
            if(existsUbs)
                return res.status(200).json({ status: "false", message: "Já existe uma Unidade Básica de Saúde cadastrada com esse nome" })
            
            ubs.Nome = name

            ubs = await Ubs.save();

            return res.status(200).json({ status: "success", message: "Setor atualizado", ubs })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getAll(req, res){
        try{
            const ubsList = await Ubs.findAll( { raw: true } ); 

            return res.status(200).json({ status: "success", ubsList })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

module.exports = new SetorController
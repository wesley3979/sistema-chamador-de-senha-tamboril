//MODELS
const Setor = require("../models/Setor");
const User = require("../models/User");
const Ubs = require("../models/Ubs");
const Senha = require("../models/Senha");

const { Op } = require("sequelize")

class SetorController {
    async insert(req, res){
        try{
            const { name, ubsId } = req.body;
            
            if(!name || !ubsId)
                return res.status(200).json({ status: "false", message: "O nome do setor e UBS são obrigatórios" })

            const existsUbs = await Ubs.findByPk(ubsId)

            if(!existsUbs)
                return res.status(200).json({ status: "false", message: "A Unidade Básica de Saúde selecionada está incorreta" })
    
            const existsSetor = await Setor.findOne({where: {Nome: name, UbsId: ubsId} })

            if(existsSetor)
                return res.status(200).json({ status: "false", message: `Já existe um setor com esse nome cadastrado Unidade Básica de Saúde ${existsUbs.Nome}` })
    
            const newSetor = {
                Nome: name,
                UbsId: ubsId,
            };

            await Setor.create(newSetor)
    
            return res.status(200).json({ status: "success", message: "Setor cadastrado" })
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async remove(req, res){
        try{
            if(!req.params.id)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o setor, tente novamente em instantes." })
        
            const existsSetor = await Setor.findByPk(req.params.id)
        
            if(!existsSetor)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o setor, tente novamente em instantes." })

            const users = await User.findOne({ where: { SetorId: existsSetor.id } } )

            if(users)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o setor, pois existem usuários cadastrados nele, remova primeiro os usuários para depois remover este setor." })

            await Senha.destroy({
                where: { SetorId: existsSetor.id }
            })
            
            await existsSetor.destroy()   
        
            return res.status(200).json({ status: "success", message: "Setor removido" })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async update(req, res){
        try{
            const { setorId, name } = req.body;
                
            if(!setorId || !name)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o setor, tente novamente em instantes" })

            let setor = await Setor.findByPk(setorId)
        
            if(!setor)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o setor, tente novamente em instantes" })

            const existsSetor = await Setor.findOne( {where: {
                name: name, 
                id: {
                    [Op.not]: setor.id
                } 
            }})
            
            if(existsSetor)
                return res.status(200).json({ status: "false", message: "Já existe um setor cadastrado com esse nome" })
            
            setor.Name = name

            setor = await setor.save();

            return res.status(200).json({ status: "success", message: "Setor atualizado", setor })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getSetores(req, res){
        try{
            const setorList = await Setor.findAll({ 
                include: [ Ubs ] 
            }); 
            
            return res.status(200).json({ status: "success", setorList })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

module.exports = new SetorController
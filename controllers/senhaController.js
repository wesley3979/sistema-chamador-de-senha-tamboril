//MODELS
const Senha = require("../models/Senha");
const Setor = require("../models/Setor");
const checkUserIsMaster = require('../helpers/checkUserIsMaster')
const { Op } = require("sequelize")

class UserController {
    async insert(senha){
        try{
            if(!senha.setorId || !senha.paciente)
                return "Informações inválidas"

            const setor = await Setor.findByPk(senha.setorId)

            if(!setor)
                return "Setor inválido"

            const lastSenha = await Senha.findOne({
                where: { SetorId:  senha.setorId},
                order: [ [ 'createdAt', 'DESC' ]],
            });

            let numero = 1

            if(lastSenha)
                numero = parseInt(lastSenha.Numero) + 1

            numero = addZeroes(numero, 4)

            return await Senha.create({
                Paciente: senha.paciente,
                Status: 1, //Na Fila
                SetorId: setor.id,
                Numero: numero,
                Preferencial: senha.preferencial
            })
        } catch (error) {
            console.log(error)
            return "Erro interno"
        }
    }

    async cancel(req, res){
        try{
            if(!req.params.id)
                return res.status(200).json({ status: "false", message: "Informações inválidas" })

            if(!checkUserIsMaster(req.session.userSCS))
                return res.status(200).json({ status: "false", message: "Você não tem autorização para realizar essa ação" })

            let senha = await Senha.findByPk(req.params.id)

            senha.Status = 3 //Cancelada
            
            await senha.save()

            return res.status(200).json({ status: "success", message: "Senha cancelada", senha })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getSenhasAtivas(req, res){
        try{
            const senhas = await Senha.findAll(
                { where: 
                    { Status: 1 },
                    include: [ Setor ] ,
                    order: [
                        ['Preferencial', 'DESC'],
                        ['createdAt', 'ASC'],
                        ['Numero', 'ASC'],
                    ],
                },
            ); 
    
            return res.status(200).json({ status: "success", senhas })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getSenhasPorSessaoAtivas(req, res){
        try{
            const senhas = await Senha.findAll(
                { where: 
                    { Status: 1, SetorId: req.session.userSCS.SetorId },
                    include: [ Setor ] ,
                    order: [
                        ['Preferencial', 'DESC'],
                        ['Numero', 'ASC'],
                    ],
                },
            ); 

            return res.status(200).json({ status: "success", senhas })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getSenhasChamadas(req, res){
        try{
            const senha = await Senha.findOne(
                { where: 
                    { Status: 2 },
                    include: [ Setor ] ,
                    order: [
                        ['Preferencial', 'DESC'],
                        ['Numero', 'ASC'],
                    ],
                },
            );

            return res.status(200).json({ status: "success", senha })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async encerrarSenha(req, res){
        try{
            const id = req.params.id

            if(!id)
                return res.status(200).json({ status: "false" })

            const senha = await Senha.findByPk(id);

            if(!senha)
                return res.status(200).json({ status: "false" })

            senha.Status = 3

            await senha.save()

            return res.status(200).json({ status: "success" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

function addZeroes(num, len) {
    var numberWithZeroes = String(num);
    var counter = numberWithZeroes.length;
    while(counter < len) {
        numberWithZeroes = "0" + numberWithZeroes;
        counter++;
    }

  return numberWithZeroes;
}

module.exports = new UserController
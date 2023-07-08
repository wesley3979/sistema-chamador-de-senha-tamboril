//MODELS
const User = require("../models/User");
const Setor = require("../models/Setor");
const Ubs = require("../models/Ubs");
const Senha = require("../models/Senha");
const Local = require("../models/Local");

const Auth = require("../helpers/auth");
const checkUserIsMaster = require('../helpers/checkUserIsMaster')
const removeSpecialChars = require('../helpers/removeSpecialChars')

const { Op } = require("sequelize")

class UserController {
    async insert(req, res){
        try{
            const { login, setorId } = req.body;
            
            if(!login || !setorId)
                return res.status(200).json({ status: "false", message: "Usuário, senha e setor são obrigatórios" })

            if(login.includes(" "))
                return res.status(200).json({ status: "false", message: "O nome do usuário não deve conter espaços" })
    
            const existsSetor = await Setor.findByPk(setorId, { include: [ Ubs ]} )

            if(!existsSetor)
                return res.status(200).json({ status: "false", message: "O setor informado é inválido" })

            const loginValidated = `${removeSpecialChars(existsSetor.Ub.Nome.toLowerCase())}.${login}`

            const existsUser = await User.findOne( {where: {Login: loginValidated}})
            
            if(existsUser)
                return res.status(200).json({ status: "false", message: "Já existe um usuário cadastrado com esse nome" })

            const temporaryPassword = Auth.generateRandomString(6)
            const passwordForsave = Auth.gerarSenha(temporaryPassword);
    
            const newUser = {
                Login: loginValidated,
                Hash: passwordForsave.hash,
                Salt: passwordForsave.salt,
                SetorId: existsSetor.id,
                IsMaster: false
            };

            if(existsSetor.Nome == "Recepção")
                newUser.IsMaster = true

            await User.create(newUser)

            let returnUser = {
                Login: loginValidated,
                Password: temporaryPassword,
            }
    
            return res.status(200).json({ status: "success", message: "Usuário cadastrado", user: returnUser })
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async remove(req, res){
        try{

            if(!checkUserIsMaster(req.session.userSCS))
                return res.status(200).json({ status: "false", message: "Você não tem autorização para realizar essa ação" })

            if(!req.params.id)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o usuário, tente novamente em instantes." })
            
            const existsUser = await User.findByPk(req.params.id)
            
            if(!existsUser)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o usuário, tente novamente em instantes." })

            await existsUser.destroy()   
            
            return res.status(200).json({ status: "success", message: "Usuário removido" })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async update(req, res){
        try{
            const { userId, login } = req.body;

            if(!userId || !login)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o usuário, tente novamente em instantes." })

            let user = await User.findByPk(userId)
        
            if(!user)
                return res.status(200).json({ status: "false", message: "Não foi possível atualizar o usuário, tente novamente em instantes." })
            
            if(login.includes(" "))
                return res.status(200).json({ status: "false", message: "O nome do usuário não deve conter espaços" })

            const loginValidated = `${user.Login.split(".")[0]}.${login}`
            
            const existsUser = await User.findOne( {where: {
                Login: loginValidated, 
                id: {
                    [Op.not]: user.id
                } 
            }})
            
            if(existsUser)
                return res.status(200).json({ status: "false", message: "Já existe um usuário cadastrado com esse nome" })
            
            user.Login = loginValidated

            user = await user.save();
            user.Hash = null
            user.Salt = null

            req.session.userSCS = user; //set cookies

            return res.status(200).json({ status: "success", message: "Usuário atualizado", user })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async viewLogin(req, res){
        return res.render("user/loginPage");
    }

    async login(req, res){
        const { login, password } = req.body;
  
        if (!login)
          return res.status(200).json({ status: "false", message: "O campo Usuário é obrigatório" })

        if (!password)
          return res.status(200).json({ status: "false", message: "O Senha é obrigatório" })
  
        const existsUser = await User.findOne({ where: { Login: login } });

        if (!existsUser)
            return res.status(200).json({ status: "false", message: "O Usuário informado está incorreto" })
  
        if (!Auth.login(password, existsUser.Salt, existsUser.Hash))
            return res.status(200).json({ status: "false", message: "Senha incorreta" })
  
        req.session.userSCS = existsUser; //set cookies

        //fazer update dos novos Salt e Hash no banco
  
        return res.status(200).json({ status: "success", message: "Usuário autorizado" })
    }

    async viewHome(req, res){
        const user = await User.findByPk(req.session.userSCS.id,
            { include: [{
                model: Setor, include: [Ubs],
                required: true
            },{
                model: Local,
                required: false
            }] }
        );

        const setorUser = await Setor.findByPk(req.session.userSCS.SetorId);

        const todaySenhas = await Senha.findAll({ 
            where: { Status: 1 },
            include: [ Setor ] ,
            order: [
                ['Preferencial', 'DESC'],
                ['createdAt', 'ASC'],
                ['Numero', 'ASC'],
            ],
        }); 
        
        const atendimentoAtual = await Senha.findOne({
            where: { Status: 2 },
            include: [ Setor ] ,
            order: [
                ['Preferencial', 'DESC'],
                ['createdAt', 'ASC'],
                ['Numero', 'ASC'],
            ],
        })

        const setorList = await Setor.findAll({
            where: { 
                UbsId : setorUser.UbsId,
                Nome: { [Op.not]: "Recepção" }
            } 
        });

        const localList = await Local.findAll({
            where: { 
                UbsId : setorUser.UbsId,
            } 
        });

        if(user.IsMaster)
            res.render("user/homeRecepcaoPage", { user, setorList });
        else
            res.render("user/homePage", { user, setorList, todaySenhas, atendimentoAtual, localList });
    }

    async getUsers(req, res){
        try{
            const userList = await User.findAll({
              include: [
                {
                  model: Setor,
                  include: [
                    {
                      model: Ubs,
                    },
                  ],
                },
              ]
            }); 

            return res.status(200).json({ status: "success", userList })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async regeneratePassword(req, res){
        try{

            if(!checkUserIsMaster(req.session.userSCS))
                return res.status(200).json({ status: "false", message: "Você não tem autorização para realizar essa ação" })

            if(!req.params.id)
                return res.status(200).json({ status: "false", message: "Não foi possível gerar a nova senha, tente novamente em instantes." })
            
            let existsUser = await User.findByPk(req.params.id)
            
            if(!existsUser)
                return res.status(200).json({ status: "false", message: "Não foi possível gerar a nova senha, tente novamente em instantes." })

            const temporaryPassword = Auth.generateRandomString(6)
            const passwordForsave = Auth.gerarSenha(temporaryPassword);

            existsUser.Hash = passwordForsave.hash
            existsUser.Salt = passwordForsave.salt
    
            await existsUser.save()

            const user = {
                Login: existsUser.Login,
                NewPassword: temporaryPassword
            }

            return res.status(200).json({ status: "success", message: "Nova senha gerada com sucesso", user })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getUserById(req, res){
        try{
            let user = await User.findByPk(req.params.id,
                { include: [{
                    model: Setor,
                    required: true
                }] }
            );
    
            if(!user)
                return res.status(200).json({ status: "false", message: "Usuário não encontrado" })

            user.Hash = null
            user.Salt = null 

            return res.status(200).json({ status: "success", user })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async getMyUserById(req, res){
        try{
            let user = await User.findByPk(req.session.userSCS.id,
                { include: [{
                    model: Setor,
                    required: true
                }] }
            );
    
            if(!user)
                return res.status(200).json({ status: "false", message: "Usuário não encontrado" })

            user.Hash = null
            user.Salt = null 

            return res.status(200).json({ status: "success", user })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async logout(req, res){
        if(req.session.userSCS)
            req.session.userSCS = null

        return res.redirect("/user/login")
    }

    async changeMyPassword(req, res){
        try{
            const {oldPassword, newPassword,} = req.body

            if(!oldPassword || !newPassword)
                return res.status(200).json({ status: "false", message: "A senha antiga e nova são obrigatórias." })

            let user = await User.findByPk(req.session.userSCS.id)

            if (!Auth.login(oldPassword, user.Salt, user.Hash))
                return res.status(200).json({ status: "false", message: "Senha antiga incorreta" })

            const passwordForsave = Auth.gerarSenha(newPassword);

            user.Hash = passwordForsave.hash
            user.Salt = passwordForsave.salt
    
            await user.save()

            return res.status(200).json({ status: "success", message: "Senha alterada com sucesso" })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async changeMySetor(req, res){
        try{
            const { setorId } = req.body

            if(!setorId)
                return res.status(200).json({ status: "false", message: "Setor inválido" })

            let setor = await Setor.findByPk(setorId)

            if (!setor)
                return res.status(200).json({ status: "false", message: "Setor inválido" })

            let user = await User.findByPk(req.session.userSCS.id)

            if (!user)
                return res.status(200).json({ status: "false", message: "Usuário inválido" })

            user.SetorId = setor.id
            req.session.userSCS.SetorId = setor.id
    
            await user.save()

            return res.status(200).json({ status: "success", message: "Setor alterado com sucesso" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async changeMyLocal(req, res){
        try{
            const { localId } = req.body

            if(!localId)
                return res.status(200).json({ status: "false", message: "Local de atendimento inválido" })

            let local = await Local.findByPk(localId)

            if (!local)
                return res.status(200).json({ status: "false", message: "Local de atendimento inválido" })

            let user = await User.findByPk(req.session.userSCS.id)

            if (!user)
                return res.status(200).json({ status: "false", message: "Usuário inválido" })

            user.LocalId = local.id
            req.session.userSCS.LocalId = local.id
    
            await user.save()

            return res.status(200).json({ status: "success", message: "Local de atendimento alterado", local })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

module.exports = new UserController
//MODELS
const Ubs = require("../models/Ubs");
const Local = require("../models/Local");
const { Op } = require("sequelize");

class SetorController {
  async insert(req, res) {
    try {
      const { name, ubsId } = req.body;

      if (!name || !ubsId)
        return res
          .status(200)
          .json({ status: "false", message: "O nome é obrigatório" });

      const existsLocal = await Local.findOne({
        where: { Nome: name, UbsId: ubsId },
      });

      if (existsLocal)
        return res.status(200).json({
          status: "false",
          message:
            "Já existe uma local de atendimento cadastrado com esse nome",
        });

      const newLocal = {
        Nome: name,
        UbsId: ubsId,
      };

      await Local.create(newLocal);

      return res.status(200).json({
        status: "success",
        message: "Novo local de atendimento cadastrada",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "false",
        message:
          "Não foi possível realizar essa operação, tente novamente mais tarde",
      });
    }
  }

  async remove(req, res) {
    try {
      if (!req.params.id)
        return res.status(200).json({
          status: "false",
          message:
            "Não foi possível remover o item, tente novamente em instantes.",
        });

      const existsLocal = await Local.findByPk(req.params.id);

      if (!existsLocal)
        return res.status(200).json({
          status: "false",
          message:
            "Não foi possível remover o item, tente novamente em instantes.",
        });

      await existsLocal.destroy();

      return res
        .status(200)
        .json({ status: "success", message: "Local de atendimento removido" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "false",
        message:
          "Não foi possível realizar essa operação, tente novamente mais tarde",
      });
    }
  }

  async update(req, res) {
    try {
      const { localId, name } = req.body;

      if (!localId || !name)
        return res.status(200).json({
          status: "false",
          message:
            "Não foi possível atualizar o item, tente novamente em instantes",
        });

      let local = await Local.findByPk(localId);

      if (!local)
        return res.status(200).json({
          status: "false",
          message:
            "Não foi possível atualizar o item, tente novamente em instantes",
        });

      const existsLocal = await Local.findOne({
        where: {
          Nome: name,
          id: {
            [Op.not]: local.id,
          },
        },
      });

      if (existsLocal)
        return res.status(200).json({
          status: "false",
          message:
            "Já existe uma Unidade Básica de Saúde cadastrada com esse nome",
        });

      local.Nome = name;

      local = await Local.save();

      return res.status(200).json({
        status: "success",
        message: "Local de atendimento atualizado",
        local,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "false",
        message:
          "Não foi possível realizar essa operação, tente novamente mais tarde",
      });
    }
  }

  async getLocalsFromUbsId(req, res) {
    try {
      const localList = await Local.findAll(
        { raw: true },
        { where: { UbsId: req.params.id } }
      );

      return res.status(200).json({ status: "success", localList });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "false",
        message:
          "Não foi possível realizar essa operação, tente novamente mais tarde",
      });
    }
  }

  async getAllLocals(req, res) {
    try {
      const localList = await Local.findAll({ include: [Ubs] });

      return res.status(200).json({ status: "success", localList });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "false",
        message:
          "Não foi possível realizar essa operação, tente novamente mais tarde",
      });
    }
  }
}

module.exports = new SetorController();

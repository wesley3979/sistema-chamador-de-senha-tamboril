//MODELS
const Video = require("../models/Video");
const Ubs = require("../models/Ubs");

const fs = require('fs');

class VideoController {
    async getAll(req, res){
        try{
            const videoList = await Video.findAll({ 
                include: [ Ubs ] 
            }); 

            return res.status(200).json({ status: "success", videoList })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async insert(req, res){
        try{
            const { ubsIdForAddVideo } = req.body

            const ubs = await Ubs.findByPk(ubsIdForAddVideo)

            if(!ubs)
                return res.status(200).json({ status: "false", message: "UBS inválida" })

            const hasVideo = await Video.findOne({ where: { UbsId: ubs.id}})
            if(hasVideo)
                return res.status(200).json({ status: "false", message: "Esta UBS já possui vídeo cadastrado" })

            if(!req.file)
                return res.status(200).json({ status: "false", message: "Arquivo não selecionado" })

            const video = {
                Path: req.file.path,
                UbsId: ubs.id
            }

            await Video.create(video)

            return res.status(200).json({ status: "success", message: "Vídeo cadastrado" })
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }

    async remove(req, res){
        try{
            const video = await Video.findByPk(req.params.id)
            if (!video)
                return res.status(200).json({ status: "false", message: "Não foi possível remover o vídeo" })
    
            if(video.Path)
                fs.unlinkSync(video.Path);

            await video.destroy();
        
            return res.status(200).json({ status: "success", message: "Vídeo removido" })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
        }
    }
}

module.exports = new VideoController
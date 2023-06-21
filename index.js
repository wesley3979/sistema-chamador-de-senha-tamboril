require('dotenv').config()

const express = require('express')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const { Op } = require("sequelize")
app.use(bodyParser.json());

const cookieSession = require('cookie-session');
require("./db/conn");

const Senha = require("./models/Senha");
const Setor = require("./models/Setor");

app.use(
    cookieSession({
        name: "session",
        secret: "c293x8b6234z82n938246bc2938x4zb234",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
);

app.use(express.static("public"));
app.use("/scripts", express.static("scripts"));
app.use("/styles", express.static("styles"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");

const routes = require("./routes");

routes(app);

app.post('/criarSenha', async (req, res) => {
    try {
        const { setorId, paciente, preferencial } = req.body
        if (!setorId || !paciente)
            return res.status(200).json({ status: "false", message: "Informações inválidas." })

        const setor = await Setor.findByPk(setorId)

        if (!setor)
            return res.status(200).json({ status: "false", message: "Setor inválido." })

        const lastSenha = await Senha.findOne({
            where: { SetorId: setorId },
            order: [['createdAt', 'DESC']],
        });

        let numero = 1

        if (lastSenha)
            numero = parseInt(lastSenha.Numero) + 1

        numero = addZeroes(numero, 4)

        const retunrSenha = await Senha.create({
            Paciente: paciente.toUpperCase(),
            Status: 1, //Na Fila
            SetorId: setor.id,
            Numero: numero,
            Preferencial: preferencial
        })

        enviaSenhasPendentes()

        return res.status(200).json({ status: "success", message: "Senha criada com sucesso.", setor, senha: retunrSenha })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "false", message: "Erro interno no servidor." })
    }
});

app.post('/chamarSenha', async (req, res) => {
    try {

        const senhaAntiga = await Senha.findOne(
            {
                where:
                    { Status: 2, SetorId: req.session.userSCS.SetorId }
            },
        );

        if (senhaAntiga) {
            senhaAntiga.Status = 3
            await senhaAntiga.save()
        }

        const senha = await Senha.findOne(
            {
                where:
                    { Status: 1, SetorId: req.session.userSCS.SetorId },
                include: [Setor],
                order: [
                    ['Preferencial', 'DESC'],
                    ['Numero', 'ASC'],
                ],
            },
        );

        if (!senha)
            return res.status(200).json({ status: "false", message: "Não há pacientes para serem chamados." })

        senha.Status = 2

        await senha.save()

        enviaSenhasPendentes()
        enviaSenhaPainel(senha)

        return res.status(200).json({ status: "success", message: "Paciente chamado", senha })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
    }
});

app.post('/cancelarSenha', async (req, res) => {
    try {
        const { senhaId } = req.body
        if (!senhaId)
            return res.status(200).json({ status: "false", message: "Senha inválida." })

        const senha = await Senha.findByPk(senhaId)

        if (!senha)
            return res.status(200).json({ status: "false", message: "Senha inválida." })

        senha.Status = 4

        senha.save()

        enviaSenhasPendentes()

        return res.status(200).json({ status: "success", message: "Senha cancelada com sucesso." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "false", message: "Erro interno no servidor." })
    }
});

app.post('/finalizarSenha', async (req, res) => {
    try {
        const { senhaId } = req.body

        const senha = await Senha.findByPk(senhaId, { include: [Setor] });
        if (!senha)
            return res.status(200).json({ status: "false", message: "Não há atendimentos para serem finalizados." })

        if (senha.Status == 2) {
            senha.Status = 3
            await senha.save()
            enviaSenhasAtendidas(senha)
        }

        return res.status(200).json({ status: "success", message: "Atendimento finalizado", senha })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "false", message: "Erro interno no servidor." })
    }
});

app.post('/regerarSenha', async (req, res) => {
    try {
        const { senhaId } = req.body

        const senha = await Senha.findByPk(senhaId, { include: [Setor] });
        if (!senha)
            return res.status(200).json({ status: "false", message: "Não há pacientes para serem chamados." })

        if (senha.Status == 2)
            enviaSenhaPainel(senha)

        return res.status(200).json({ status: "success", message: "Paciente chamado", senha })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: "false", message: "Não foi possível realizar essa operação, tente novamente mais tarde" })
    }
});

const enviaSenhasPendentes = async () => {
    try {
        const senhas = await Senha.findAll(
            {
                where:
                    { Status: 1 },
                include: [Setor],
                order: [
                    ['Preferencial', 'DESC'],
                    ['createdAt', 'ASC'],
                    ['Numero', 'ASC'],
                ],
            },
        );

        io.emit('senhas pendentes', senhas);
    } catch (err) {
        console.log(err);
    }
}

const enviaSenhasAtendidas = async () => {
    try {

        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const senhas = await Senha.findAll(
            {
                where:
                {
                    Status: 3,
                    updatedAt: {
                        [Op.gte]: date,
                    }
                },
                include: [Setor],
                order: [
                    ['Preferencial', 'DESC'],
                    ['createdAt', 'ASC'],
                    ['Numero', 'ASC'],
                ],
            },
        );

        io.emit('senhas atendidas', senhas);
    } catch (err) {
        console.log(err);
    }
}

const enviaSenhaPainel = async (senha) => {
    try {
        io.emit('painel', senha);
    } catch (err) {
        console.log(err);
    }
}

function addZeroes(num, len) {
    var numberWithZeroes = String(num);
    var counter = numberWithZeroes.length;
    while (counter < len) {
        numberWithZeroes = "0" + numberWithZeroes;
        counter++;
    }

    return numberWithZeroes;
}

io.on('connection', (socket) => {
    enviaSenhasPendentes()
    enviaSenhasAtendidas()

    socket.on('disconnect', () => { });
});

const port = 3000;

http.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
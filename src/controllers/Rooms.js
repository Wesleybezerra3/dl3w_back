const { Sala } = require("../models");
const { Turma } = require("../models");

exports.getAllRooms = async(req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 8;
        let offset;

        // Calcula o offset para a paginação dos livros
        if (page && limit) {
            offset = (page - 1) * limit;
        }


        const rooms = await Sala.findMany({
            select: { id: true, nome: true, capacidade: true, localizacao: true, turmas: true },
            take: Number(limit), skip: Number(offset)
        });

        const totalRooms = await Sala.count();

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ message: "Nenhuma Sala encontrada" });
        }

        return res.status(200).json({
            rooms,
            total_rooms: totalRooms
        })
    } catch (error) {
        console.error("Erro ao listar turmas:", error);
        return res.status(500).json({ error: "Erro ao listar salas" });
    }
};

exports.createRoom = async(req, res) => {
    try {
        const { nome, capacidade, localizacao } = req.body;

        if (!nome || capacidade == null || !localizacao) {
            console.log(nome, capacidade, localizacao)
            return res.status(400).json({ message: "Campos obrigatórios: nome, capacidade, localizacao" });
        }

        const capacidadeNum = parseInt(capacidade, 10);
        if (Number.isNaN(capacidadeNum) || capacidadeNum <= 0) {
            return res.status(400).json({ message: "Capacidade deve ser um número inteiro positivo" });
        }

        const novaSala = await Sala.create({
            nome,
            capacidade: capacidadeNum,
            localizacao,
        });

        return res.status(201).json(novaSala);
    } catch (error) {
        console.error("Erro ao criar sala:", error);
        return res.status(500).json({ error: "Erro ao criar sala" });
    }
};

exports.searchRooms = async(req, res) => {
    try {
        const { roomName } = req.query; // Obtém o título da consulta
        let salas;

        // Se o título não for fornecido, retorna todos os salas
        if (!roomName) {
            salas = await Sala.findMany();
            return res.status(404).json({ message: 'O nome não foi fornecido' });
        } else {
            // Busca salas cujo título contém a string especificada
            salas = await Sala.findMany({
                where: {
                    nome: { contains: roomName },
                },
            });
        }

        if (salas.length === 0) {
            return res.status(200).json([]);
        }

        // Converte os resultados em objetos simples
        const roomData = salas;

        return res.status(200).json(roomData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar salas!" });
    }
};

exports.getByName = async(req, res) => {
    const name = req.query.name;
    try {
        const sala = await Sala.findFirst({
            where: { nome: name },
            include: { turmas: true },
        });
        if (sala) {
            res.status(200).json(sala);
        } else {
            res.status(404).json({ message: "Sala não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar sala:", error);
        res.status(500).json({ message: "Erro ao buscar Sala" });
    }
};

exports.updateRoom = async(req, res) => {
    try {
        const { id } = req.query;
        const { nome, localizacao, capacidade } = req.body;

        if (!id) {
            return res.status(400).json({ message: "id não informada" });
        }

        // Busca o estudante pela matrícula
        const sala = await Sala.findUnique({ where: { id: Number(id) } });

        if (!sala) {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }

        // Atualizações básicas
        const updated = await Sala.update({ where: { id: Number(id) }, data: {
            ...(nome ? { nome } : {}), ...(localizacao ? { localizacao } : {}), ...(capacidade ? { capacidade: Number(capacidade) } : {})
        } });

        return res.status(200).json({
            message: "Dados atualizados com sucesso",
            sala: updated
        });

    } catch (error) {
        console.error("Erro ao atualizar da sala:", error);
        return res.status(500).json({ message: "Erro ao atualizar sala" });
    }
};

// exports.getClassesAll = async (req, res) => {
//   try {
//     const classes = await Turma.findMany({
//       include: [
//         {
//           model: Sala,
//           as: "sala",
//           attributes: ["id", "nome", "capacidade", "localizacao"],
//         },
//         {
//           model: Curso,
//           as: "curso",
//           attributes: ["id", "nome", "duracao_meses"],
//         },
//         {
//           model: Aluno,
//           as: "alunos",
//           attributes: ["id"],
//           required: false,
//         },
//       ],
//     });

//     // Adiciona a quantidade de alunos em cada turma
//     const result = classes.map((turma) => {
//       const turmaJson = turma.toJSON();
//       turmaJson.qtd_alunos = turmaJson.alunos ? turmaJson.alunos.length : 0;
//       delete turmaJson.alunos; // opcional: remove o array de alunos do retorno
//       return turmaJson;
//     });

//     if (!result || result.length === 0) {
//       return res.status(404).json({ message: "Nenhuma turma encontrada" });
//     }

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Erro ao listar turmas:", error);
//     res.status(500).json({ error: "Erro ao listar turmas" });
//   }
// };
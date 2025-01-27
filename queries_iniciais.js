// **-- Inclusão de usuários**

db.tb_usuario.insertOne({
  nome: "João Silva",
  email: "joao.silva@email.com",
  senha: "senha123",
  data_criacao: new Date(),
});
db.tb_usuario.insertOne({
  nome: "Maria Oliveira",
  email: "maria.oliveira@email.com",
  senha: "senha123",
  data_criacao: new Date(),
});

// **-- Inclusão de conexões**

db.tb_conexao.insertOne({
  id_seguidor: ObjectId("id_joao"),
  id_seguido: ObjectId("id_maria"),
  data_conexao: new Date(),
}); // Substitua pelos _ids corretos
db.tb_conexao.insertOne({
  id_seguidor: ObjectId("id_maria"),
  id_seguido: ObjectId("id_joao"),
  data_conexao: new Date(),
});

// **-- Inclusão de conteúdos**

db.tb_conteudo.insertOne({
  titulo: "Primeiro conteúdo",
  texto: { conteudo_texto: "Conteúdo do texto 1" },
  data_criacao: new Date(),
});
db.tb_conteudo.insertOne({
  titulo: "abrobinha",
  texto: { conteudo_texto: "Conteúdo do texto 2" },
  data_criacao: new Date(),
});
db.tb_conteudo.insertOne({
  titulo: "abrobinha",
  texto: { conteudo_texto: "Conteúdo do texto 3" },
  data_criacao: new Date(),
});

// **-- Inclusão de publicações**

db.tb_publicacao.insertOne({
  id_conteudo: ObjectId("id_conteudo_1"),
  data_publicacao: new Date(),
}); // Substitua pelo _id do conteúdo
db.tb_publicacao.insertOne({
  id_conteudo: ObjectId("id_conteudo_2"),
  data_publicacao: new Date(),
});

// **-- Inclusão de coautores**

db.tb_publicacao_usuario.insertOne({
  publicacao_id: ObjectId("id_publicacao_1"),
  autores: [
    { usuario_id: ObjectId("id_joao"), papel: "Autor Principal" },
    { usuario_id: ObjectId("id_maria"), papel: "Coautor" },
  ],
});

// **-- Comandos de Alteração**

// **-- Atualizar o nome de um usuário**

db.tb_usuario.updateOne(
  { _id: ObjectId("id_joao") },
  { $set: { nome: "João Pedro Silva" } }
);

// **-- Alterar o título de um conteúdo**

db.tb_conteudo.updateOne(
  { _id: ObjectId("id_conteudo_1") },
  { $set: { titulo: "Primeiro conteúdo atualizado" } }
);

// **-- Alterar o papel de um coautor**

db.tb_publicacao_usuario.updateOne(
  {
    publicacao_id: ObjectId("id_publicacao_1"),
    "autores.usuario_id": ObjectId("id_maria"),
  },
  { $set: { "autores.$.papel": "Revisor" } }
);

// **-- EXCLUSAO**

// **-- Excluir uma conexão entre dois usuários**

db.tb_conexao.deleteOne({
  id_seguidor: ObjectId("id_maria"),
  id_seguido: ObjectId("id_joao"),
});

// **-- Excluir uma publicação**

db.tb_publicacao.deleteOne({ _id: ObjectId("id_publicacao_2") });

// **-- Excluir um conteúdo e suas dependências (cascata)**

// 1. Obter o id_conteudo da publicação a ser excluída
const publicacao = db.tb_publicacao.findOne({
  _id: ObjectId("id_publicacao_2"),
});

// 2. Excluir a publicação
db.tb_publicacao.deleteOne({ _id: ObjectId("id_publicacao_2") });

// 3. Excluir os documentos relacionados em tb_publicacao_usuario
db.tb_publicacao_usuario.deleteMany({ publicacao_id: publicacao.id_conteudo });

// 4. Excluir o conteúdo
db.tb_conteudo.deleteOne({ _id: publicacao.id_conteudo });

// **-- BUSCAS SIMPLES**

// **-- Buscar todos os usuários**

db.tb_usuario.find({});

// **-- Buscar todas as conexões**

db.tb_conexao.find({});

// **-- Buscar todas as publicações**

db.tb_publicacao.find({});

// **-- Buscar os conteúdos criados**

db.tb_conteudo.find({});

// **-- INTERMEDIARIAS**

// **-- Buscar os usuários e suas conexões**

db.tb_conexao.aggregate([
  {
    $lookup: {
      from: "tb_usuario",
      localField: "id_seguidor",
      foreignField: "_id",
      as: "seguidor",
    },
  },
  { $unwind: "$seguidor" },
  {
    $lookup: {
      from: "tb_usuario",
      localField: "id_seguido",
      foreignField: "_id",
      as: "seguido",
    },
  },
  { $unwind: "$seguido" },
  {
    $project: {
      _id: 0,
      Seguidor: "$seguidor.nome",
      Seguido: "$seguido.nome",
    },
  },
]);

// **-- Buscar publicações com o nome dos autores**

db.tb_publicacao.aggregate([
  {
    $lookup: {
      from: "tb_publicacao_usuario",
      localField: "_id",
      foreignField: "publicacao_id",
      as: "publicacao_usuario",
    },
  },
  { $unwind: "$publicacao_usuario" },
  { $unwind: "$publicacao_usuario.autores" },
  {
    $lookup: {
      from: "tb_usuario",
      localField: "publicacao_usuario.autores.usuario_id",
      foreignField: "_id",
      as: "autor",
    },
  },
  { $unwind: "$autor" },
  {
    $project: {
      _id: 0,
      id_publicacao: "$_id",
      data_publicacao: 1,
      Autor: "$autor.nome",
      Papel: "$publicacao_usuario.autores.papel",
    },
  },
]);

// **-- Buscar conteúdos com o número de publicações relacionadas**

db.tb_conteudo.aggregate([
  {
    $lookup: {
      from: "tb_publicacao",
      localField: "_id",
      foreignField: "id_conteudo",
      as: "publicacoes",
    },
  },
  {
    $project: {
      _id: 0,
      id_conteudo: "$_id",
      titulo: 1,
      Total_Publicacoes: { $size: "$publicacoes" },
    },
  },
]);

// **--AVANCADAS**

// **-- Buscar os coautores de cada publicação**

db.tb_publicacao.aggregate([
  {
    $lookup: {
      from: "tb_publicacao_usuario",
      localField: "_id",
      foreignField: "publicacao_id",
      as: "publicacao_usuario",
    },
  },
  { $unwind: "$publicacao_usuario" },
  { $unwind: "$publicacao_usuario.autores" },
  {
    $lookup: {
      from: "tb_usuario",
      localField: "publicacao_usuario.autores.usuario_id",
      foreignField: "_id",
      as: "autor",
    },
  },
  { $unwind: "$autor" },
  {
    $group: {
      _id: {
        id_publicacao: "$_id",
        data_publicacao: "$data_publicacao",
      },
      Coautores: { $addToSet: "$autor.nome" },
    },
  },
  {
    $project: {
      _id: 0,
      id_publicacao: "$_id.id_publicacao",
      data_publicacao: "$_id.data_publicacao",
      Coautores: {
        $reduce: {
          input: "$Coautores",
          initialValue: "",
          in: {
            $cond: [
              { $eq: ["$$value", ""] },
              "$$this",
              { $concat: ["$$value", ", ", "$$this"] },
            ],
          },
        },
      },
    },
  },
]);

// **-- Buscar usuários que são autores e também seguidores de outros usuários**

db.tb_usuario.aggregate([
  {
    $lookup: {
      from: "tb_publicacao_usuario",
      localField: "_id",
      foreignField: "autores.usuario_id",
      as: "publicacoes_usuario",
    },
  },
  { $match: { "publicacoes_usuario.0": { $exists: true } } },
  {
    $lookup: {
      from: "tb_conexao",
      localField: "_id",
      foreignField: "id_seguidor",
      as: "conexoes",
    },
  },
  { $match: { "conexoes.0": { $exists: true } } },
  {
    $project: {
      _id: 0,
      Usuario: "$nome",
    },
  },
]);

// **-- Buscar publicações com título, coautores e número de conexões dos autores**

db.tb_publicacao.aggregate([
  {
    $lookup: {
      from: "tb_conteudo",
      localField: "id_conteudo",
      foreignField: "_id",
      as: "conteudo",
    },
  },
  { $unwind: "$conteudo" },
  {
    $lookup: {
      from: "tb_publicacao_usuario",
      localField: "_id",
      foreignField: "publicacao_id",
      as: "publicacao_usuario",
    },
  },
  { $unwind: "$publicacao_usuario" },
  { $unwind: "$publicacao_usuario.autores" },
  {
    $lookup: {
      from: "tb_usuario",
      localField: "publicacao_usuario.autores.usuario_id",
      foreignField: "_id",
      as: "autor",
    },
  },
  { $unwind: "$autor" },
  {
    $lookup: {
      from: "tb_conexao",
      localField: "autor._id",
      foreignField: "id_seguidor",
      as: "conexoes_autor",
    },
  },
  {
    $group: {
      _id: {
        id_publicacao: "$_id",
        titulo: "$conteudo.titulo",
      },
      Coautores: { $addToSet: "$autor.nome" },
      Total_Conexoes: { $sum: { $size: "$conexoes_autor" } },
    },
  },
  {
    $project: {
      _id: 0,
      id_publicacao: "$_id.id_publicacao",
      Titulo: "$_id.titulo",
      Coautores: {
        $reduce: {
          input: "$Coautores",
          initialValue: "",
          in: {
            $cond: [
              { $eq: ["$$value", ""] },
              "$$this",
              { $concat: ["$$value", ", ", "$$this"] },
            ],
          },
        },
      },
      Total_Conexoes: 1,
    },
  },
]);

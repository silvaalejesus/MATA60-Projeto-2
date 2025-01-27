// **1. `mv_crescimento_usuarios` (Materialized View)**

db.tb_usuario.aggregate([
  {
    $group: {
      _id: { $month: "$data_criacao" }, // Agrupa por mês da data de criação
      novos_usuarios: { $sum: 1 }, // Conta os usuários em cada mês
    },
  },
  { $sort: { _id: 1 } }, // Ordena pelo mês
]);

// // **2. `mv_tipo_conteudo` (Materialized View)**

db.tb_conteudo.aggregate([
  {
    $group: {
      _id: null, // Agrupa todos os documentos
      total_textos: { $sum: { $cond: [{ $ifNull: ["$texto", false] }, 1, 0] } },
      total_imagens: {
        $sum: { $cond: [{ $ifNull: ["$imagem", false] }, 1, 0] },
      },
      total_videos: { $sum: { $cond: [{ $ifNull: ["$video", false] }, 1, 0] } },
      total_links: { $sum: { $cond: [{ $ifNull: ["$link", false] }, 1, 0] } },
    },
  },
]);

// // **3. `sp_usuarios_mais_ativos` (Stored Procedure)**

function sp_usuarios_mais_ativos() {
  const resultado = db.tb_usuario
    .aggregate([
      {
        $lookup: {
          from: "tb_publicacao_usuario",
          localField: "_id",
          foreignField: "autores.usuario_id",
          as: "publicacoes_usuario",
        },
      },
      {
        $lookup: {
          from: "tb_conexao",
          localField: "_id",
          foreignField: "id_seguidor",
          as: "conexoes",
        },
      },
      {
        $project: {
          _id: 1,
          nome: 1,
          total_publicacoes: { $size: "$publicacoes_usuario" },
          total_conexoes: { $size: "$conexoes" },
        },
      },
      {
        $project: {
          _id: 1,
          nome: 1,
          total_publicacoes: 1,
          total_conexoes: 1,
          pontuacao: { $add: ["$total_publicacoes", "$total_conexoes"] },
        },
      },
      { $sort: { pontuacao: -1 } },
      { $limit: 1 },
    ])
    .toArray()[0];

  print(
    "ID Usuário:",
    resultado._id,
    "Nome:",
    resultado.nome,
    "Total de Publicações:",
    resultado.total_publicacoes,
    "Total de Conexões:",
    resultado.total_conexoes,
    "Pontuação:",
    resultado.pontuacao
  );
}
sp_usuarios_mais_ativos();

// // **4. `sp_conexoes_mutuas` (Stored Procedure)**

function sp_conexoes_mutuas() {
  const resultado = db.tb_conexao
    .aggregate([
      {
        $lookup: {
          from: "tb_conexao",
          let: { seguidor: "$id_seguidor", seguido: "$id_seguido" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id_seguidor", "$$seguido"] },
                    { $eq: ["$id_seguido", "$$seguidor"] },
                  ],
                },
              },
            },
          ],
          as: "conexao_inversa",
        },
      },
      { $match: { "conexao_inversa.0": { $exists: true } } },
      {
        $group: {
          _id: { usuario1: "$id_seguidor", usuario2: "$id_seguido" },
          total_mutuas: { $sum: 1 },
        },
      },
      { $sort: { total_mutuas: -1 } },
      { $limit: 1 },
    ])
    .toArray()[0];

  print(
    "Usuário 1:",
    resultado._id.usuario1,
    "Usuário 2:",
    resultado._id.usuario2,
    "Total de conexões mútuas:",
    resultado.total_mutuas
  );
}
sp_conexoes_mutuas();

// // **5. `vw_distribuicao_conexoes`, `vw_publicacoes_populares`, `vw_atividade_usuarios` (Views)**

db.tb_usuario.aggregate([
  {
    $lookup: {
      from: "tb_conexao",
      let: { usuarioId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: ["$id_seguidor", "$$usuarioId"] },
                { $eq: ["$id_seguido", "$$usuarioId"] },
              ],
            },
          },
        },
      ],
      as: "conexoes",
    },
  },
  {
    $project: {
      _id: 0,
      id_usuario: "$_id",
      nome: 1,
      total_seguidores: {
        $size: {
          $filter: {
            input: "$conexoes",
            cond: { $eq: ["$$this.id_seguido", "$_id"] },
          },
        },
      },
      total_seguidos: {
        $size: {
          $filter: {
            input: "$conexoes",
            cond: { $eq: ["$$this.id_seguidor", "$_id"] },
          },
        },
      },
    },
  },
]);

// // **`vw_publicacoes_populares`**

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
  {
    $project: {
      _id: 0,
      id_publicacao: "$_id",
      titulo: "$conteudo.titulo",
      total_coautores: { $size: "$publicacao_usuario.autores" },
    },
  },
  { $sort: { total_coautores: -1 } },
]);

// // * **`vw_atividade_usuarios`**

db.tb_usuario.aggregate([
  {
    $lookup: {
      from: "tb_publicacao_usuario",
      localField: "_id",
      foreignField: "autores.usuario_id",
      as: "publicacoes_usuario",
    },
  },
  {
    $lookup: {
      from: "tb_conexao",
      localField: "_id",
      foreignField: "id_seguidor",
      as: "conexoes",
    },
  },
  {
    $project: {
      _id: 0,
      id_usuario: "$_id",
      nome: 1,
      total_publicacoes: { $size: "$publicacoes_usuario" },
      total_conexoes: { $size: "$conexoes" },
    },
  },
  { $sort: { total_publicacoes: -1, total_conexoes: -1 } },
]);

// // **6. `vw_palavras_mais_comuns` (View)**

db.tb_conteudo.aggregate([
  { $unwind: { path: "$titulo", includeArrayIndex: "arrayIndex" } },
  { $group: { _id: "$titulo", ocorrencias: { $sum: 1 } } },
  { $sort: { ocorrencias: -1 } },
  { $project: { _id: 0, palavra: "$_id", ocorrencias: 1 } },
]);

// tb_usuario
db.createCollection("tb_usuario", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "email", "senha"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        nome: {
          bsonType: "string",
          maxLength: 100,
        },
        email: {
          bsonType: "string",
          maxLength: 150,
        },
        senha: {
          bsonType: "string",
        },
        data_criacao: {
          bsonType: "date",
        },
      },
    },
  },
  indexes: [
    { key: { email: 1 }, unique: true }, // Índice único para o campo email
  ],
});

// tb_conexao
db.createCollection("tb_conexao", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_seguidor", "id_seguido"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        id_seguidor: {
          bsonType: "objectId", // Referencia _id de tb_usuario
        },
        id_seguido: {
          bsonType: "objectId", // Referencia _id de tb_usuario
        },
        data_conexao: {
          bsonType: "date",
        },
      },
    },
  },
  indexes: [
    { key: { id_seguidor: 1, id_seguido: 1 }, unique: true }, // Índice único composto
  ],
});

// tb_publicacao
db.createCollection("tb_publicacao", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_conteudo"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        id_conteudo: {
          bsonType: "objectId", // Referencia _id de tb_conteudo
        },
        data_publicacao: {
          bsonType: "date",
        },
      },
    },
  },
});

db.createCollection("tb_conteudo", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        _id: {
          bsonType: "objectId",
        },
        titulo: {
          bsonType: "string",
          maxLength: 50,
        },
        data_criacao: {
          bsonType: "date",
        },
        texto: {
          bsonType: "object",
          required: ["conteudo_texto"],
          properties: {
            conteudo_texto: {
              bsonType: "string",
            },
          },
        },
        // ----> Imagem embutida:
        imagem: {
          // Campo que representa a imagem
          bsonType: "object",
          properties: {
            // Não é obrigatório ter imagem
            url_img: {
              bsonType: "string",
            },
          },
        },
        // <----
        // ----> Vídeo embutido:
        video: {
          // Campo que representa o vídeo
          bsonType: "object",
          properties: {
            // Não é obrigatório ter vídeo
            url_video: {
              bsonType: "string",
            },
          },
        },
        // <----
        // ----> Link embutido:
        link: {
          // Campo que representa o link
          bsonType: "object",
          properties: {
            // Não é obrigatório ter link
            url_link: {
              bsonType: "string",
            },
          },
        },
        // <----
      },
    },
  },
});

db.createCollection("tb_publicacao_usuario", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["publicacao_id", "autores"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        publicacao_id: {
          bsonType: "objectId", // Referencia _id de tb_publicacao
        },
        autores: {
          // Array de autores
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["usuario_id", "papel"],
            properties: {
              usuario_id: {
                bsonType: "objectId", // Referencia _id de tb_usuario
              },
              papel: {
                bsonType: "string",
                enum: ["autor", "coautor"],
              },
            },
          },
        },
      },
    },
  },
});

/* Lembrando a estrutura das coleções:

tb_usuario: _id, nome, email, senha, data_criacao
tb_conexao: _id, id_seguidor, id_seguido, data_conexao
tb_conteudo: _id, titulo, data_criacao, texto, imagem, video, link
tb_publicacao: _id, id_conteudo, data_publicacao
tb_publicacao_usuario: _id, publicacao_id, autores (array de usuario_id e papel) */

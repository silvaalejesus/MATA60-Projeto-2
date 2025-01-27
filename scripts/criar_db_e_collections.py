import pymongo

# 1. Estabeleça a conexão com o servidor MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")  # Substitua pela sua string de conexão

# 2. Acesse o banco de dados (ele será criado se não existir)
db = client["rede_social"]  # Substitua por um nome para o seu banco de dados

# 4. Verifique se o banco de dados foi criado
print(client.list_database_names())  # Imprime a lista de bancos de dados

# --- Criar as coleções com schemas ---
# tb_usuario
db.create_collection("tb_usuario", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["nome", "email", "senha"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "nome": {
                "bsonType": "string",
                "maxLength": 100
            },
            "email": {
                "bsonType": "string",
                "maxLength": 150
            },
            "senha": {
                "bsonType": "string"
            },
            "data_criacao": {
                "bsonType": "date"
            }
        }
    }
})

# Add index for email uniqueness
db.tb_usuario.create_index([("email", pymongo.ASCENDING)], unique=True)

# tb_conexao
db.create_collection("tb_conexao", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id_seguidor", "id_seguido"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "id_seguidor": {
                "bsonType": "objectId"
            },
            "id_seguido": {
                "bsonType": "objectId"
            },
            "data_conexao": {
                "bsonType": "date"
            }
        }
    }
})

# Add index for unique follower-followed relationships
db.tb_conexao.create_index([("id_seguidor", pymongo.ASCENDING), ("id_seguido", pymongo.ASCENDING)], unique=True)

# tb_publicacao
db.create_collection("tb_publicacao", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id_conteudo"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "id_conteudo": {
                "bsonType": "objectId"
            },
            "data_publicacao": {
                "bsonType": "date"
            }
        }
    }
})

# tb_conteudo
db.create_collection("tb_conteudo", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "titulo": {
                "bsonType": "string",
                "maxLength": 50
            },
            "data_criacao": {
                "bsonType": "date"
            },
            "texto": {
                "bsonType": "object",
                "required": ["conteudo_texto"],
                "properties": {
                    "conteudo_texto": {
                        "bsonType": "string"
                    }
                }
            },
            "imagem": {
                "bsonType": "object",
                "properties": {
                    "url_img": {
                        "bsonType": "string"
                    }
                }
            },
            "video": {
                "bsonType": "object",
                "properties": {
                    "url_video": {
                        "bsonType": "string"
                    }
                }
            },
            "link": {
                "bsonType": "object",
                "properties": {
                    "url_link": {
                        "bsonType": "string"
                    }
                }
            }
        }
    }
})

# tb_publicacao_usuario
db.create_collection("tb_publicacao_usuario", validator={
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["publicacao_id", "autores"],
        "properties": {
            "_id": {
                "bsonType": "objectId"
            },
            "publicacao_id": {
                "bsonType": "objectId"
            },
            "autores": {
                "bsonType": "array",
                "items": {
                    "bsonType": "object",
                    "required": ["usuario_id", "papel"],
                    "properties": {
                        "usuario_id": {
                            "bsonType": "objectId"
                        },
                        "papel": {
                            "bsonType": "string",
                            "enum": ["autor", "coautor"]
                        }
                    }
                }
            }
        }
    }
})

print("Coleções criadas com sucesso!")

client.close()
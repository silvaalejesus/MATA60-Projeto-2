import pymongo
from faker import Faker
from datetime import datetime, timedelta
import random

# Conexão com o MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")  # Substitua pela sua string de conexão
db = client["rede_social"]  # Substitua pelo nome do seu banco de dados

# Faker para gerar dados falsos
fake = Faker('pt_BR')

# --- Gerar dados para tb_usuario ---
usuarios = []
emails_usados = set()  # Conjunto para armazenar os emails já usados
for i in range(10):  # Gere 10 usuários
    usuario = {
        "nome": fake.name(),
        "senha": "senha_criptografada_" + fake.word(),  # Substitua por criptografia real
        "data_criacao": fake.date_time_between(start_date="-1y", end_date="now")
    }
    # Gera um email único
    while True:
        email = fake.email()
        if email not in emails_usados:
            emails_usados.add(email)
            usuario["email"] = email
            break
    usuarios.append(usuario)

db.tb_usuario.insert_many(usuarios)

# --- Gerar dados para tb_conexao ---
conexoes = []
conexoes_existentes = set()  # Conjunto para armazenar as conexões já existentes
for i in range(20):  # Gere 20 conexões
    while True:
        id_seguidor = random.choice(usuarios)['_id']
        id_seguido = random.choice(usuarios)['_id']
        # Verifica se a conexão já existe e se o usuário não está seguindo a si mesmo
        if (id_seguidor, id_seguido) not in conexoes_existentes and id_seguidor != id_seguido:
            conexoes_existentes.add((id_seguidor, id_seguido))
            conexao = {
                "id_seguidor": id_seguidor,
                "id_seguido": id_seguido,
                "data_conexao": fake.date_time_between(start_date="-1y", end_date="now")
            }
            conexoes.append(conexao)
            break

db.tb_conexao.insert_many(conexoes)

# --- Gerar dados para tb_conteudo ---
conteudos = []
for i in range(15):  # Gere 15 conteúdos
    conteudo = {
        "titulo": fake.sentence(nb_words=6, variable_nb_words=True)[:50],
        "data_criacao": fake.date_time_between(start_date="-1y", end_date="now"),
        "texto": {
            "conteudo_texto": fake.paragraph(nb_sentences=5)
        }
    }
    # Adicionar imagem, vídeo e link aleatoriamente
    if random.random() < 0.7:  # 70% de chance de ter imagem
        conteudo["imagem"] = {"url_img": fake.image_url()}
    if random.random() < 0.5:  # 50% de chance de ter vídeo
        conteudo["video"] = {"url_video": fake.url()}
    if random.random() < 0.3:  # 30% de chance de ter link
        conteudo["link"] = {"url_link": fake.url()}
    conteudos.append(conteudo)

db.tb_conteudo.insert_many(conteudos)

# --- Gerar dados para tb_publicacao ---
publicacoes = []
for i in range(30):  # Gere 30 publicações
    publicacao = {
        "id_conteudo": random.choice(conteudos)['_id'],
        "data_publicacao": fake.date_time_between(start_date="-1y", end_date="now")
    }
    publicacoes.append(publicacao)

db.tb_publicacao.insert_many(publicacoes)

# --- Gerar dados para tb_publicacao_usuario ---
publicacoes_usuarios = []
for publicacao in publicacoes:  # Itera sobre as publicações
    autores = []  # Lista de autores para a publicação atual
    num_autores = random.randint(1, 3)  # Número aleatório de autores (1 a 3)
    for i in range(num_autores):
        usuario_id = random.choice(usuarios)['_id']
        papel = "autor" if i == 0 else "coautor"  # O primeiro é autor, os demais coautores
        autores.append({"usuario_id": usuario_id, "papel": papel})

    publicacao_usuario = {
        "publicacao_id": publicacao['_id'],
        "autores": autores
    }
    publicacoes_usuarios.append(publicacao_usuario)

db.tb_publicacao_usuario.insert_many(publicacoes_usuarios)

print("Dados inseridos com sucesso!")

client.close()
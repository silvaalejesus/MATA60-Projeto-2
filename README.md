## Relatório de Novos Requisitos, Coleções e Variáveis no MongoDB

Este relatório descreve os novos requisitos, coleções e variáveis que foram definidos para modelar o sistema no MongoDB.

- **Email único:** Garantir que o campo `email` na coleção `tb_usuario` seja único, evitando duplicatas.
- **Relacionamento N:M:** Representar corretamente o relacionamento N:M entre `tb_publicacao` e `tb_usuario`, permitindo que uma publicação tenha vários autores (autor principal e coautores).
- **Coleção `tb_publicacao_usuario`:** Criar uma coleção para armazenar as relações entre publicações e usuários, com os campos `publicacao_id`, `usuario_id` e `papel`.
- **Array de autores:** Representar os autores de uma publicação em um array dentro da coleção `tb_publicacao_usuario`, evitando duplicação de documentos.
- **Stored procedures:** Criar funções JavaScript para encapsular a lógica de algumas consultas e procedures.
- **Migração de queries:** Migrar as queries SQL existentes para o MongoDB, adaptando-as para a nova estrutura do banco de dados.

**Coleções:**

- **`tb_usuario`:**
  - `_id`: ObjectId
  - `nome`: String (100 caracteres)
  - `email`: String (150 caracteres, único)
  - `senha`: String
  - `data_criacao`: Date
- **`tb_conexao`:**
  - `_id`: ObjectId
  - `id_seguidor`: ObjectId (referencia `tb_usuario`)
  - `id_seguido`: ObjectId (referencia `tb_usuario`)
  - `data_conexao`: Date
- **`tb_conteudo`:**
  - `_id`: ObjectId
  - `titulo`: String (50 caracteres)
  - `data_criacao`: Date
  - `texto`: Objeto (contém `conteudo_texto`)
  - `imagem`: Objeto (contém `url_img`)
  - `video`: Objeto (contém `url_video`)
  - `link`: Objeto (contém `url_link`)
- **`tb_publicacao`:**
  - `_id`: ObjectId
  - `id_conteudo`: ObjectId (referencia `tb_conteudo`)
  - `data_publicacao`: Date
- **`tb_publicacao_usuario`:**

  - `_id`: ObjectId
  - `publicacao_id`: ObjectId (referencia `tb_publicacao`)
  - `autores`: Array de objetos, cada objeto com: - `usuario_id`: ObjectId (referencia `tb_usuario`) - `papel`: String ("autor" ou "coautor")
    **Observações:**

- As stored procedures foram convertidas em funções JavaScript.
- As queries SQL foram migradas para o MongoDB, utilizando agregações e outros recursos para obter os mesmos resultados.

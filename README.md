
# Trabalho de Sistemas Distribuidos - Conteineres Docker

## Video da apresentacao

<a href=  "https://www.youtube.com/watch?v=DE9zUTwAkFw">
  <img src=  "https://img.youtube.com/vi/DE9zUTwAkFw/maxresdefault.jpg" width="640" alt="Apresentação do trabalho">
</a>

Ambiente orquestrado via Docker Compose com 4 conteineres:

| Conteiner | Imagem | Porta no host | Funcao |
|-----------|--------|---------------|--------|
| `trabalho_web` | Node.js 20 (build local) | **8080** | Sistema web CRUD de alunos |
| `trabalho_db` | postgres:16-alpine | *(nao exposto)* | Banco de dados (so rede interna) |
| `trabalho_adminer` | adminer:latest | **8081** | Administracao web do Postgres |
| `trabalho_portainer` | portainer/portainer-ce | **9000** / 9443 | Gerencia grafica dos conteineres |

## Como executar

Na pasta do projeto:

```bash
docker compose up -d --build
```

Depois acesse:

- Sistema web (CRUD de alunos): http://localhost:8080
- Adminer: http://localhost:8081
  - Sistema: **PostgreSQL**
  - Servidor: `db`
  - Usuario: `app`
  - Senha: `app_pass`
  - Base: `trabalho`
- Portainer: http://localhost:9000 (criar admin no primeiro acesso)

Para derrubar:

```bash
docker compose down          # mantem o volume (dados preservados)
docker compose down -v       # remove tambem o volume db_data (apaga dados)
```

## Estrutura

```
trabalho-docker/
├── docker-compose.yml      # orquestracao dos 4 servicos
├── init.sql                # schema + dados iniciais do Postgres
├── README.md
└── app/
    ├── Dockerfile          # imagem do sistema web
    ├── package.json
    ├── server.js           # Express + rotas CRUD
    ├── .dockerignore
    ├── public/style.css
    └── views/
        ├── index.ejs       # listagem de alunos
        └── form.ejs        # form de novo / editar
```



## Como o requisito de seguranca do BD foi atendido

O servico `db` **nao declara nenhuma porta em `ports:`**, logo a porta 5432 do
Postgres nao eh publicada na maquina hospedeira. Os demais servicos acessam o
banco pelo hostname `db` na rede bridge `internal` criada pelo Compose - isso
satisfaz a exigencia "disponivel apenas localmente (para os demais conteineres)
e nao para todas as maquinas externas".

## Persistencia

Os dados do Postgres ficam no volume nomeado `db_data`. Mesmo executando
`docker compose down` e subindo novamente, os registros permanecem. Para zerar
o banco use `docker compose down -v`.


-- Schema inicial criado automaticamente quando o conteiner do Postgres sobe
-- pela primeira vez (executado pelo docker-entrypoint-initdb.d).
-- Se o volume db_data ja existir, este script NAO eh re-executado.

CREATE TABLE IF NOT EXISTS alunos (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    matricula       VARCHAR(20)  NOT NULL UNIQUE,
    curso           VARCHAR(80)  NOT NULL,
    email           VARCHAR(150),
    telefone        VARCHAR(20),
    data_nascimento DATE,
    cidade          VARCHAR(80),
    estado          CHAR(2),
    periodo         INT,
    bio             TEXT,
    linkedin        VARCHAR(200),
    github          VARCHAR(200),
    avatar_color    VARCHAR(7)   NOT NULL DEFAULT '#2563eb',
    criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seeds variados para o video ja mostrar dados ricos na tela
INSERT INTO alunos
    (nome, matricula, curso, email, telefone, data_nascimento, cidade, estado, periodo, bio, linkedin, github, avatar_color)
VALUES
    (
        'Ana Souza', '2024001', 'Sistemas de Informacao',
        'ana.souza@example.com', '(11) 98765-4321', '2002-03-14',
        'Sao Paulo', 'SP', 5,
        'Apaixonada por dados e visualizacao. Curte transformar planilhas em historias.',
        'https://linkedin.com/in/anasouza', 'https://github.com/anasouza',
        '#2563eb'
    ),
    (
        'Bruno Lima', '2024002', 'Ciencia da Computacao',
        'bruno.lima@example.com', '(21) 99887-1122', '2001-07-22',
        'Rio de Janeiro', 'RJ', 7,
        'Fascinado por sistemas distribuidos e containers. Sempre brincando com Docker no fim de semana.',
        'https://linkedin.com/in/brunolima', 'https://github.com/brunolima',
        '#dc2626'
    ),
    (
        'Carla Mendes', '2024003', 'Engenharia de Software',
        'carla.mendes@example.com', '(31) 98123-4567', '2003-11-02',
        'Belo Horizonte', 'MG', 3,
        'Desenvolvedora front-end em formacao. Adora CSS, acessibilidade e cafe.',
        'https://linkedin.com/in/carlamendes', 'https://github.com/carlamendes',
        '#16a34a'
    ),
    (
        'Diego Tavares', '2024004', 'Analise e Desenvolvimento de Sistemas',
        'diego.tavares@example.com', '(41) 99654-3210', '2000-05-09',
        'Curitiba', 'PR', 4,
        'Backend Node.js e Postgres. Aprendendo Kubernetes em paralelo.',
        'https://linkedin.com/in/diegotavares', 'https://github.com/diegotavares',
        '#9333ea'
    ),
    (
        'Eduarda Ribeiro', '2024005', 'Ciencia de Dados',
        'eduarda.ribeiro@example.com', '(51) 98321-7766', '2002-09-18',
        'Porto Alegre', 'RS', 6,
        'Estuda machine learning aplicado a educacao. Fa de Python e Jupyter.',
        'https://linkedin.com/in/eduardaribeiro', 'https://github.com/eduardaribeiro',
        '#ea580c'
    )
ON CONFLICT (matricula) DO NOTHING;

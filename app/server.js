const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Helpers expostos para os templates ---------------------------
function iniciais(nome) {
    if (!nome) return '?';
    const partes = String(nome).trim().split(/\s+/);
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    const primeira = partes[0].charAt(0);
    const ultima = partes[partes.length - 1].charAt(0);
    return (primeira + ultima).toUpperCase();
}

function escurecerCor(hex, fator = 0.65) {
    if (!hex || typeof hex !== 'string') return '#1d4ed8';
    const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
    if (!m) return hex;
    const num = parseInt(m[1], 16);
    const r = Math.max(0, Math.min(255, Math.round(((num >> 16) & 0xff) * fator)));
    const g = Math.max(0, Math.min(255, Math.round(((num >> 8) & 0xff) * fator)));
    const b = Math.max(0, Math.min(255, Math.round((num & 0xff) * fator)));
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function dataPtBr(valor) {
    if (!valor) return null;
    const d = valor instanceof Date ? valor : new Date(valor);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function dataHoraPtBr(valor) {
    if (!valor) return null;
    const d = valor instanceof Date ? valor : new Date(valor);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('pt-BR');
}

// Formata YYYY-MM-DD para o input type=date (sem timezone surpresa)
function dataIso(valor) {
    if (!valor) return '';
    const d = valor instanceof Date ? valor : new Date(valor);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

// Disponibiliza helpers globalmente para todos os EJS
app.locals.iniciais = iniciais;
app.locals.escurecerCor = escurecerCor;
app.locals.dataPtBr = dataPtBr;
app.locals.dataHoraPtBr = dataHoraPtBr;
app.locals.dataIso = dataIso;

// ---------- Utilitario para coletar campos do body ----------------------
function camposDoBody(body) {
    const limpar = (v) => {
        if (v === undefined || v === null) return null;
        const s = String(v).trim();
        return s === '' ? null : s;
    };
    const periodoNum = limpar(body.periodo);
    return {
        nome: limpar(body.nome),
        matricula: limpar(body.matricula),
        curso: limpar(body.curso),
        email: limpar(body.email),
        telefone: limpar(body.telefone),
        data_nascimento: limpar(body.data_nascimento),
        cidade: limpar(body.cidade),
        estado: limpar(body.estado) ? limpar(body.estado).toUpperCase() : null,
        periodo: periodoNum === null ? null : Number(periodoNum),
        bio: limpar(body.bio),
        linkedin: limpar(body.linkedin),
        github: limpar(body.github),
        avatar_color: limpar(body.avatar_color) || '#2563eb',
    };
}

// ---------- Rotas -------------------------------------------------------

// Lista todos os alunos
app.get('/', async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, nome, matricula, curso, email, periodo, avatar_color, criado_em
             FROM alunos
             ORDER BY id ASC`
        );
        res.render('index', { alunos: rows });
    } catch (err) {
        next(err);
    }
});

// Perfil individual
app.get('/perfil/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM alunos WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.redirect('/');
        res.render('perfil', { aluno: rows[0] });
    } catch (err) {
        next(err);
    }
});

// Formulario de cadastro
app.get('/novo', (req, res) => {
    res.render('form', { aluno: null, acao: '/novo', titulo: 'Novo aluno', erro: null });
});

// Cria novo aluno
app.post('/novo', async (req, res, next) => {
    const dados = camposDoBody(req.body);
    try {
        await pool.query(
            `INSERT INTO alunos
                (nome, matricula, curso, email, telefone, data_nascimento,
                 cidade, estado, periodo, bio, linkedin, github, avatar_color)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [
                dados.nome, dados.matricula, dados.curso, dados.email, dados.telefone,
                dados.data_nascimento, dados.cidade, dados.estado, dados.periodo,
                dados.bio, dados.linkedin, dados.github, dados.avatar_color,
            ]
        );
        res.redirect('/');
    } catch (err) {
        res.status(400).render('form', {
            aluno: req.body,
            acao: '/novo',
            titulo: 'Novo aluno',
            erro: err.code === '23505' ? 'Matricula ja cadastrada.' : err.message,
        });
    }
});

// Formulario de edicao
app.get('/editar/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM alunos WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.redirect('/');
        res.render('form', {
            aluno: rows[0],
            acao: `/editar/${req.params.id}`,
            titulo: 'Editar aluno',
            erro: null,
        });
    } catch (err) {
        next(err);
    }
});

// Atualiza aluno
app.post('/editar/:id', async (req, res, next) => {
    const dados = camposDoBody(req.body);
    try {
        await pool.query(
            `UPDATE alunos SET
                nome=$1, matricula=$2, curso=$3, email=$4, telefone=$5,
                data_nascimento=$6, cidade=$7, estado=$8, periodo=$9,
                bio=$10, linkedin=$11, github=$12, avatar_color=$13
             WHERE id=$14`,
            [
                dados.nome, dados.matricula, dados.curso, dados.email, dados.telefone,
                dados.data_nascimento, dados.cidade, dados.estado, dados.periodo,
                dados.bio, dados.linkedin, dados.github, dados.avatar_color,
                req.params.id,
            ]
        );
        res.redirect(`/perfil/${req.params.id}`);
    } catch (err) {
        res.status(400).render('form', {
            aluno: { ...req.body, id: req.params.id },
            acao: `/editar/${req.params.id}`,
            titulo: 'Editar aluno',
            erro: err.code === '23505' ? 'Matricula ja cadastrada.' : err.message,
        });
    }
});

// Exclui aluno
app.post('/excluir/:id', async (req, res, next) => {
    try {
        await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

// Healthcheck simples
app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(`<pre>Erro: ${err.message}</pre>`);
});

app.listen(PORT, () => {
    console.log(`Sistema rodando em http://localhost:${PORT}`);
});

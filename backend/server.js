const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, 'database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'unifor-secret';
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao abrir o banco SQLite:', err.message);
        return reject(err);
      }
      resolve();
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) return reject(err);
      db = null;
      resolve();
    });
  });
}

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}


async function ensureColumn(tableName, columnName, columnDefinition) {
  const columns = await new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info('${tableName}')`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((row) => row.name));
    });
  });

  if (!columns.includes(columnName)) {
    await runQuery(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  }
}

async function createUsuarioTable() {
  await runQuery(`CREATE TABLE IF NOT EXISTS Usuario(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL DEFAULT '',
    data_nascimento TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await ensureColumn('Usuario', 'nome', 'nome TEXT NOT NULL DEFAULT ""');
  await ensureColumn('Usuario', 'data_nascimento', 'data_nascimento TEXT NOT NULL DEFAULT ""');
  await ensureColumn('Usuario', 'email', 'email TEXT NOT NULL UNIQUE');
  await ensureColumn('Usuario', 'senha', 'senha TEXT NOT NULL');
  await ensureColumn('Usuario', 'criado_em', 'criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
}

async function createProdutoTable() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS Produto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      categoria TEXT,
      estado TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES Usuario(id)
    );
  `);

  const columns = await new Promise((resolve, reject) => {
    db.all("PRAGMA table_info('Produto')", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map((row) => row.name));
    });
  });

  if (!columns.includes('categoria')) {
    await runQuery('ALTER TABLE Produto ADD COLUMN categoria TEXT');
  }

  if (!columns.includes('estado')) {
    await runQuery('ALTER TABLE Produto ADD COLUMN estado TEXT');
  }
}

async function startServer() {
  try {
    await initializeDatabase();
    await createUsuarioTable();
    await createProdutoTable();
    app.listen(3001, () => {
      console.log('API rodando na porta 3001');
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

app.post('/register', async (req, res) => {
  const { nome, data_nascimento, email, senha } = req.body;
  try {
    const usuarioExistente = await getQuery('SELECT id FROM Usuario WHERE email = ?', [email]);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const nascimento = data_nascimento || '';
    await runQuery(
      'INSERT INTO Usuario (nome, data_nascimento, email, senha) VALUES (?, ?, ?, ?)',
      [nome, nascimento, email, hashedPassword]
    );

    res.json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await getQuery('SELECT * FROM Usuario WHERE email = ?', [email]);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const jwt = require('jsonwebtoken');

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login realizado com sucesso!', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

app.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const usuario = await getQuery(
      'SELECT nome, email, data_nascimento FROM Usuario WHERE id = ?',
      [req.user.id]
    );

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

app.post('/vendas', autenticarToken, async (req, res) => {
  const { titulo, descricao, preco, categoria, estado } = req.body;
  try {
    await runQuery(
      'INSERT INTO Produto (usuario_id, titulo, descricao, preco, categoria, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, titulo, descricao, preco, categoria || null, estado || null]
    );
    res.json({ message: 'Produto cadastrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});


app.get('/vendas', async (req, res) => {
  try {
    db.all('SELECT Produto.id, titulo, descricao, preco, categoria, estado, Usuario.nome AS vendedor FROM Produto JOIN Usuario ON Produto.usuario_id = Usuario.id', [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao listar produtos' });
      }
      res.json(rows);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.delete('/vendas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await getQuery('SELECT * FROM Produto WHERE id = ?', [id]);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    await runQuery('DELETE FROM Produto WHERE id = ?', [id]);
    res.json({ message: 'Produto excluído com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

app.delete ('/perfil', autenticarToken, async (req, res) => {
  try {
   const usuario = await getQuery('SELECT * FROM Usuario WHERE id = ?', [req.user.id]);
   if (!usuario) {
     return res.status(404).json({ error: 'Usuário não encontrado' });
   }
   await runQuery('DELETE FROM Usuario WHERE id = ?', [req.user.id]);
   res.json({ message: 'Usuário excluído com sucesso!' }); 
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});



if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  initializeDatabase,
  createUsuarioTable,
  createProdutoTable,
  closeDatabase,
  startServer
};


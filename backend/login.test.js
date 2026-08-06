const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const testDbPath = path.join(__dirname, 'test-database.sqlite');
process.env.DB_PATH = testDbPath;
const { app, initializeDatabase, createUsuarioTable, createProdutoTable, closeDatabase } = require('./server');

function createDatabaseRow(dbPath, email, senha) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(
      'INSERT INTO Usuario (nome, data_nascimento, email, senha) VALUES (?, ?, ?, ?)',
      ['Ana', '2000-01-01', email, senha],
      (err) => {
        db.close();
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

test('POST /login autentica usuário existente', async () => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  await initializeDatabase();
  await createUsuarioTable();

  const hashedPassword = await bcrypt.hash('123456', 10);
  await createDatabaseRow(testDbPath, 'ana@teste.com', hashedPassword);

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@teste.com', senha: '123456' })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(body.token, 'o login deve retornar um token');
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await closeDatabase();
  }
});

test('createUsuarioTable adiciona data_nascimento em tabelas antigas', async () => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  await initializeDatabase();

  const db = new sqlite3.Database(testDbPath);
  await new Promise((resolve, reject) => {
    db.run('CREATE TABLE Usuario(id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senha TEXT NOT NULL)', (err) => {
      db.close();
      if (err) return reject(err);
      resolve();
    });
  });

  await createUsuarioTable();

  const columns = await new Promise((resolve, reject) => {
    const schemaDb = new sqlite3.Database(testDbPath);
    schemaDb.all("PRAGMA table_info('Usuario')", [], (err, rows) => {
      schemaDb.close();
      if (err) return reject(err);
      resolve(rows.map((row) => row.name));
    });
  });

  assert.ok(columns.includes('data_nascimento'), 'a coluna data_nascimento deve existir após a migração');
  await closeDatabase();
});

test('DELETE /perfil exclui o usuário autenticado', async () => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  await initializeDatabase();
  await createUsuarioTable();

  const hashedPassword = await bcrypt.hash('123456', 10);
  await createDatabaseRow(testDbPath, 'bia@teste.com', hashedPassword);

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const token = jwt.sign({ id: 1, email: 'bia@teste.com' }, 'unifor-secret', { expiresIn: '1h' });
    const response = await fetch(`http://127.0.0.1:${server.address().port}/perfil`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    assert.equal(response.status, 200);

    const usuario = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath);
      db.get('SELECT * FROM Usuario WHERE email = ?', ['bia@teste.com'], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });

    assert.equal(usuario, undefined);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await closeDatabase();
  }
});

test('POST /vendas cadastra produto no banco', async () => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  await initializeDatabase();
  await createUsuarioTable();
  await createProdutoTable();

  const hashedPassword = await bcrypt.hash('123456', 10);
  await createDatabaseRow(testDbPath, 'ana@teste.com', hashedPassword);

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const token = jwt.sign({ id: 1, email: 'ana@teste.com' }, 'unifor-secret', { expiresIn: '1h' });
    const response = await fetch(`http://127.0.0.1:${server.address().port}/vendas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo: 'Caneca',
        descricao: 'Caneca de alumínio',
        preco: 29.9,
        categoria: 'materiais',
        estado: 'novo'
      })
    });

    assert.equal(response.status, 200);

    const produto = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath);
      db.get('SELECT * FROM Produto WHERE titulo = ?', ['Caneca'], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });

    assert.ok(produto, 'o produto deve ser persistido no banco');
    assert.equal(produto.categoria, 'materiais');
    assert.equal(produto.estado, 'novo');
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await closeDatabase();
  }
});

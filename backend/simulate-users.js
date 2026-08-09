const fetch = global.fetch;
const { app, initializeDatabase, createUsuarioTable, createProdutoTable, closeDatabase } = require('./server');
const port = 3002;
const server = app.listen(port, () => console.log('Servidor de teste iniciado em http://127.0.0.1:' + port));

async function request(path, options = {}) {
  const url = 'http://127.0.0.1:' + port + path;
  const res = await fetch(url, options);
  let body;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, body };
}

(async () => {
  try {
    await initializeDatabase();
    await createUsuarioTable();
    await createProdutoTable();

    const userA = { nome: 'Usuario A', data_nascimento: '1990-01-01', email: 'usuarioA+' + Date.now() + '@teste.com', senha: 'senhaA123' };
    const userB = { nome: 'Usuario B', data_nascimento: '1991-02-02', email: 'usuarioB+' + Date.now() + '@teste.com', senha: 'senhaB123' };

    const regA = await request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA)
    });
    console.log('Registro A:', regA.status, regA.body);

    const regB = await request('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB)
    });
    console.log('Registro B:', regB.status, regB.body);

    const loginA = await request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userA.email, senha: userA.senha })
    });
    console.log('Login A:', loginA.status, loginA.body);

    const loginB = await request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userB.email, senha: userB.senha })
    });
    console.log('Login B:', loginB.status, loginB.body);

    if (!loginB.body || !loginB.body.token) {
      throw new Error('Falha no login de B');
    }
    const tokenB = loginB.body.token;

    const produto = {
      titulo: 'Produto de Teste '+Date.now(),
      descricao: 'Criado pelo usuário B em novo dispositivo',
      preco: 123.45,
      categoria: 'livros',
      estado: 'novo'
    };

    const createProduct = await request('/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify(produto)
    });
    console.log('Criar produto por B:', createProduct.status, createProduct.body);

    const compras = await request('/compras');
    console.log('Consulta /compras:', compras.status, Array.isArray(compras.body) ? compras.body.length : 'erro', 'produtos');

    const found = Array.isArray(compras.body) && compras.body.some(p => p.titulo === produto.titulo && p.descricao === produto.descricao);
    console.log('Produto visível em /compras?', found);
  } catch (err) {
    console.error('Erro durante a simulação:', err);
  } finally {
    server.close(() => console.log('Servidor de teste parado'));
    await closeDatabase();
    process.exit(0);
  }
})();

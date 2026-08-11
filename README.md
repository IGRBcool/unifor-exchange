PROJETO UNIFOR-EXCHANGE (desafio Vortex)

Aplicação web que permite os alunos da Universidade de Fortaleza e outros a cadastrarem seus produtos e comprarem de outros!

Comando backend: "node server.js" em Git Bash
Comando frontend: "npm start" em Git Bash

Frameworks e bibliotecas utilizadas:
Backend: Express,CORS,bcrypt,jsonwebtoken,sqlite3 e path.
Frontend: React,Tailwind e AXIOS.




Diário de bordo da IA (Copilot e Github Copilot foram utilizados):

🔹 Primeiros passos
Você começou com um erro no Perfil.jsx: AxiosError: Request failed with status code 500.

Identificamos que o problema estava no backend: uso incorreto de jwt.verify e sintaxe de Postgres ($1, rows[0]) em vez de SQLite.

Corrigimos para usar JWT_SECRET e getQuery com ?.

🔹 Ajustes no backend
Criamos a rota /perfil corretamente fora do /login.

Adicionamos console.log para depuração e vimos que o erro era “no such column: nome”.

Descobrimos que a tabela Usuario não tinha as colunas novas.

Recriamos/alteramos a tabela para incluir nome e data_nascimento.

Resultado: a rota /perfil passou a retornar os dados do usuário corretamente.

🔹 Evolução para marketplace
Criamos a tabela Produto com colunas: titulo, descricao, preco, categoria, estado.

Implementamos rotas:

POST /vendas → cadastrar produto (somente usuário autenticado).

GET /vendas → listar produtos.

Depois, ajustamos para que /vendas mostre apenas os produtos do usuário logado.

Criamos /compras para listar todos os produtos de todos os usuários, com filtros e pesquisa.

🔹 Frontend
Construímos páginas:

Login → autenticação e armazenamento do token no localStorage.

Perfil → exibe dados do usuário autenticado.

Vendas → formulário para cadastrar produto e lista dos produtos do usuário.

Compras → lista de todos os produtos com barra de pesquisa e filtros.

Ajustamos o App.js com React Router para proteger rotas:

Bloqueio da tela de login quando o usuário já está logado.

Redirecionamento para /login se não houver token.

Logout remove o token e volta para login.

🔹 Últimos ajustes
Corrigimos os imports das páginas (LoginPage, Perfil, Vendas, Compras, Menu).

Garantimos que /login fica inacessível para usuários logados.

Agora o ciclo está completo: cadastro → login → perfil → vendas → compras → logout.





Prompts do GITHUB COPILOT:

"Os filtros em compras.jsx não estão funcionando corretamente, pode corrigir isso?"



Vou inspecionar a lógica do componente de compras e reproduzir o comportamento para localizar a causa antes de ajustar os filtros.

A investigação indicou que a página já envia os parâmetros ao backend; agora estou verificando o endpoint para confirmar se ele está aplicando esses filtros corretamente.

Read server.js

O fluxo de envio está correto no front, então estou validando a integração com o backend para identificar por que o filtro não está surtindo efeito.

Estou adicionando um teste de regressão para reproduzir o problema de respostas antigas sobrescreverem os filtros mais recentes.

Created Compras.test.jsx

A causa mais provável é a atualização assíncrona sobrescrever o estado com respostas antigas. Estou aplicando uma correção para garantir que somente a última requisição válida atualize a lista.

cd "c:/Users/igorc/OneDrive/Documentos/CSS/unifor-exchange/frontend" && npm test -- --watch=false --runInBand --runTestsByPath src/pages/Compras.test.jsx
A correção será pequena e localizada: eu vou garantir que somente a resposta da última busca atualize a lista, evitando que resultados antigos sobrescrevam os filtros mais recentes.

Edited
Compras.jsx+12-4
A alteração já está no componente; estou rodando o teste novamente para validar que a lista agora acompanha a última busca.

✅ Correção aplicada
Os filtros em Compras.jsx agora funcionam de forma consistente, inclusive quando as respostas da API chegam fora de ordem.

O que foi ajustado
Evitei que respostas antigas sobrescrevessem os resultados da última busca.
O componente agora usa a última requisição válida para atualizar a lista de produtos.
Também normalizei a busca para remover espaços extras antes de enviar ao backend.




"Um erro está ocorrendo: ao fazer o login, a página se mantém na rota login, e o menu só é ativado ao reiniciar o api. Pode consertar isso?"


Vou verificar o fluxo de login e o estado do token após a resposta da API, porque o redirecionamento parece estar acontecendo em um ponto que não está refletindo no componente atual.

O problema está no fato de que o roteador lê o token uma vez no início e não atualiza após o login. Vou mudar isso para que a aplicação reaja ao armazenamento do token imediatamente após o login.


App.js+11-1
A correção foi aplicada no ponto onde o estado do usuário é lido; agora a aplicação vai reagir imediatamente ao token assim que o login for concluído.

✅ Correção aplicada
O problema acontecia porque o roteamento estava lendo o token apenas uma vez no carregamento inicial. Depois do login, o app não “reconhecia” a nova sessão até reiniciar.

O que foi ajustado
O componente principal agora monitora o token em estado React.
Assim que o token é salvo no localStorage, o app atualiza a rota automaticamente.
O login passa a levar direto para o menu sem depender de reinicialização da API.


Em alguns momentos, o Copilot ou o Github Copilot criavam códigos e soluções não compatíveis com os códigos anteriores, como erros de declaração de variáveis e funções. O que me fez inspecionar o terminal algumas vezes para identificar os erros erros mais precisamente, e somente assim dar a instrução correta e precisa.

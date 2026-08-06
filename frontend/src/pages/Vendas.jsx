import { useState, useEffect } from 'react';
import axios from 'axios';

function Vendas() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');

  const carregarProdutos = async () => {
    try {
      const response = await axios.get('/vendas');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    }
  };


  async function excluirProduto(id) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/vendas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Produto excluído com sucesso!');
      carregarProdutos();
    } catch (error) {
      alert('Erro ao excluir produto');
    }
  }


    useEffect(() => {
      carregarProdutos();
    }, []);

    const cadastrarProduto = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        await axios.post('/vendas', { titulo, descricao, preco, categoria, estado }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Produto cadastrado com sucesso!');
        setTitulo('');
        setDescricao('');
        setPreco('');
        setCategoria('');
        setEstado('');
        carregarProdutos();
      } catch (error) {
        alert('Erro ao cadastrar produto');
      }
    };

    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Página de Vendas</h2>
        <form onSubmit={cadastrarProduto} className="flex flex-col gap-4 mb-6">
          <input
            className="p-2 border rounded font-bold"
            type="text"
            placeholder="Título do produto"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <select
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Selecione uma categoria</option>
            <option value="eletronicos">Eletrônicos</option>
            <option value="vestuario">Vestuário</option>
            <option value="livros">Livros</option>
            <option value="materiais">Materiais</option>
          </select>
          <select
            placeholder="Estado:"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="p-2 border rounded">
            <option value="">Selecione o estado do produto</option>
            <option value="novo">Novo</option>
            <option value="usado">Usado</option>

          </select>

          <textarea
            className="p-2 border rounded font-bold"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            className="p-2 border rounded font-bold"
            type="number"
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
            Cadastrar novo produto
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Seus produtos</h3>
        <ul className="space-y-2">
          {produtos.map((p) => (
            <li key={p.id} className="border p-4 rounded">
              <div className="right-0 top-0 flex justify-end">
                <button onClick={() => excluirProduto(p.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 mb-2 flex gap-2">
                  Excluir das suas vendas
                </button>
              </div>

              <strong>{p.titulo}</strong> - R$ {p.preco}
              <p>{p.descricao}</p>
              <p>Categoria: {p.categoria}</p>
              <p>Estado: {p.estado}</p>
              <small>Vendedor: {p.vendedor}</small>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  export default Vendas;

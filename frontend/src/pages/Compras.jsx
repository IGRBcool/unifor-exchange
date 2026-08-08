import { useState, useEffect } from 'react';
import axios from 'axios';

function Compras() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');

  const carregarProdutos = async () => {
    try {
      const response = await axios.get('/compras', {
        params: { busca, categoria, estado }
      });
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, [busca, categoria, estado]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-yellow-600 mb-4">Página de Compras</h2>


      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      />


      <div className="flex gap-4 mb-6">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todas categorias</option>
          <option value="Eletrônicos">Eletrônicos</option>
          <option value="Roupas">Roupas</option>
          <option value="Livros">Livros</option>
        </select>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todos estados</option>
          <option value="Novo">Novo</option>
          <option value="Usado">Usado</option>
        </select>
      </div>

      <div className="flex items-center justify-between mb-4 font-bold">
        <h2>Produtos disponíveis</h2>
      </div>

      <ul className="space-y-2">
        {produtos.map((p) => (
          <li key={p.id} className="border p-4 rounded">
            <strong>{p.titulo}</strong> - R$ {p.preco}
            <p>{p.descricao}</p>
            <small>Categoria: {p.categoria} | Estado: {p.estado}</small><br />
            <small>Vendedor: {p.vendedor}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Compras;

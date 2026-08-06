import { Link } from 'react-router-dom';

function Menu() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Menu Principal</h1>
      <div className="flex flex-col gap-4 w-64">
        <Link to="/vendas" className="bg-green-500 text-white py-2 rounded text-center hover:bg-green-600">
          Página de Vendas
        </Link>
        <Link to="/compras" className="bg-yellow-500 text-white py-2 rounded text-center hover:bg-yellow-600">
          Página de Compras
        </Link>
        <Link to="/perfil" className="bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600">
          Perfil do Usuário
        </Link>
      </div>
    </div>
  );
}

export default Menu;

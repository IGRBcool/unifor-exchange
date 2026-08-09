import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Perfil() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get('/perfil', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setUser(response.data);
      } catch (error) {
        console.error('Erro ao carregar perfil', error);
      }
    };

    fetchPerfil();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e seus dados serão excluídos permanentemente.');
    if (!confirmed) return;

    try {
      await axios.delete('/perfil', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      localStorage.removeItem('token');
      alert('Conta excluída com sucesso!');
      window.location.replace('/login');
    } catch (error) {
      console.error('Erro ao excluir conta', error);
      alert('Não foi possível excluir a conta no momento.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Perfil do Usuário</h2>

      <div className=" flex gap-3 mb-11">
        <button
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          onClick={handleLogout}
        >
          Sair da conta
        </button>
        <button
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          onClick={handleDeleteAccount}
        >
          Excluir conta
        </button>
      </div>

      {user ? (
        <div className="space-y-2">
          <p><strong>Nome:</strong> {user.nome}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Data de Nascimento:</strong> {user.data_nascimento}</p>
        </div>
      ) : (
        <p>Carregando perfil...</p>
      )}
    </div>
  );
}

export default Perfil;

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from '../src/pages/LoginPage';
import Perfil from '../src/pages/Perfil';
import Vendas from '../src/pages/Vendas';
import Compras from '../src/pages/Compras';
import Menu from '../src/pages/Menu';
import Cadastro from '../src/pages/Cadastro';

function App() {
  const [token, setToken] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const syncToken = () => setToken(Boolean(localStorage.getItem('token')));
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/menu" replace /> : <Login />} />
        <Route path="/perfil" element={token ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/vendas" element={token ? <Vendas /> : <Navigate to="/login" replace />} />
        <Route path="/compras" element={token ? <Compras /> : <Navigate to="/login" replace />} />
        <Route path="/menu" element={token ? <Menu /> : <Navigate to="/login" replace />} />
        <Route path="/cadastro" element={token ? <Navigate to="/menu" replace /> : <Cadastro />} />
        <Route path="/" element={<Navigate to={token ? "/menu" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;

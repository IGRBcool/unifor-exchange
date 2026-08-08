import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/LoginPage';
import Perfil from './pages/Perfil';
import Vendas from './pages/Vendas';
import Compras from './pages/Compras';
import Menu from './pages/Menu';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/Perfil" element={token ? <Perfil /> : <Navigate to="/login" />} />
        <Route path="/Vendas" element={token ? <Vendas /> : <Navigate to="/login" />} />
        <Route path="/Compras" element={token ? <Compras /> : <Navigate to="/login" />} />
        <Route path="/Menu" element={token ? <Menu /> : <Navigate to="/login" />} />

        <Route path="/" element={<Navigate to={token ? "/login" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

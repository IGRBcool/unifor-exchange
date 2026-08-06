import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/Cadastro';
import MenuPage from './pages/Menu';
import VendasPage from './pages/Vendas';
import ComprasPage from './pages/Compras';
import PerfilPage from './pages/Perfil';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/vendas" element={<VendasPage />} />
        <Route path="/compras" element={<ComprasPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
      </Routes>
    </Router>
  );
}

export default App;

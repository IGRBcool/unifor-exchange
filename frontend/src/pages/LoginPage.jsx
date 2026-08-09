import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LoginPage() { 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { email, senha });
      const token = response.data?.token;

      if (!token) {
        throw new Error('Token não recebido');
      }

      localStorage.setItem('token', token);
      window.location.replace('/menu');
    } catch (error) {
      alert('Credenciais inválidas!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Seja Bem-vindo ao Unifor Exchange!
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            type="email"
            placeholder="E-mail institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="submit"
            onClick={handleLogin}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-blue-600 hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

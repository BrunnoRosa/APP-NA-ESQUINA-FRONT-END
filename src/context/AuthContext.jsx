import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api, { registerAuthErrorHandler } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função centralizada de logout que limpa tudo e zera o estado
  async function logout() {
    try {
      await AsyncStorage.removeItem('@AppNaEsquina:token');
      await AsyncStorage.removeItem('@AppNaEsquina:user');
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.log('Erro ao limpar dados no logout:', error);
    } finally {
      setUser(null); // Isso faz o App.js trocar para a tela de Login imediatamente
    }
  }

  useEffect(() => {
    // Registra o callback no api.js para ser chamado se houver um erro 401 global
    registerAuthErrorHandler(() => {
      setUser(null); // Atualiza o estado do React na mesma hora
    });

    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@AppNaEsquina:token');
        const storedUser = await AsyncStorage.getItem('@AppNaEsquina:user');

        if (storedToken && storedUser) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Erro ao carregar dados do storage:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function login(email, senha, lembrar = true) {
    const response = await api.post('/api/auth/login', { email, senha });
    const { token, idUsuario, nome, perfil } = response.data;
    const userData = { email, idUsuario, nome, perfil };

    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    if (lembrar) {
      // Guarda no aparelho: o login continua depois de fechar o app
      await AsyncStorage.setItem('@AppNaEsquina:token', token);
      await AsyncStorage.setItem('@AppNaEsquina:user', JSON.stringify(userData));
    } else {
      // Não guarda: apaga qualquer login salvo antes
      await AsyncStorage.removeItem('@AppNaEsquina:token');
      await AsyncStorage.removeItem('@AppNaEsquina:user');
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        signed: !!user, 
        user, 
        loading, 
        login, 
        logout,
        // Aliases para evitar quebras se algum componente chamar signIn/signOut
        signIn: login,
        signOut: logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
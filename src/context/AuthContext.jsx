import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api, { registerAuthErrorHandler } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function logout() {
    try {
      await AsyncStorage.removeItem('@AppNaEsquina:token');
      await AsyncStorage.removeItem('@AppNaEsquina:user');
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.log('Erro ao limpar dados no logout:', error);
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    registerAuthErrorHandler(() => {
      setUser(null);
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

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    let idMercadinho =
      response.data?.idMercadinho ||
      response.data?.mercadinho?.idMercadinho ||
      response.data?.mercadinho?.id ||
      null;

    if (!idMercadinho && perfil === 'COMERCIANTE') {
      try {
        const resMercadinhos = await api.get('/api/mercadinhos');
        const listaMercadinhos = Array.isArray(resMercadinhos.data)
          ? resMercadinhos.data
          : resMercadinhos.data?.content || [];

        const meuMercadinho = listaMercadinhos.find((m) => {
          const comId =
            m.comercianteId ||
            m.comerdante_id ||
            m.idComerciante ||
            m.usuario?.idUsuario ||
            m.comerciante?.idUsuario ||
            m.comerciante?.id;
          return Number(comId) === Number(idUsuario);
        });

        if (meuMercadinho) {
          idMercadinho = meuMercadinho.idMercadinho || meuMercadinho.id;
        }
      } catch (err) {
        console.warn('Não foi possível carregar idMercadinho automaticamente:', err);
      }
    }

    const userData = { email, idUsuario, nome, perfil, idMercadinho };

    setUser(userData);

    if (lembrar) {
      await AsyncStorage.setItem('@AppNaEsquina:token', token);
      await AsyncStorage.setItem('@AppNaEsquina:user', JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem('@AppNaEsquina:token');
      await AsyncStorage.removeItem('@AppNaEsquina:user');
    }
  }

  async function atualizarUsuario(parcial) {
    const novo = { ...user, ...parcial };
    setUser(novo);
    try {
      const salvo = await AsyncStorage.getItem('@AppNaEsquina:user');
      if (salvo) await AsyncStorage.setItem('@AppNaEsquina:user', JSON.stringify(novo));
    } catch (error) {
      console.log('Erro ao atualizar usuário no storage:', error);
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
        atualizarUsuario,
        signIn: login,
        signOut: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
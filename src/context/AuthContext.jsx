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

    // Set do token no header da API antes de buscar dados complementares
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 1. Tenta pegar o idMercadinho vindo direto do login
    let idMercadinho = 
      response.data?.idMercadinho || 
      response.data?.mercadinho?.idMercadinho || 
      response.data?.mercadinho?.id;

    // 2. Se não veio no login, busca na lista geral de mercadinhos para localizar o id_mercadinho do comerciante
    if (!idMercadinho) {
      try {
        const resMercadinhos = await api.get('/api/mercadinhos');
        const listaMercadinhos = Array.isArray(resMercadinhos.data) 
          ? resMercadinhos.data 
          : (resMercadinhos.data?.content || []);

        // Procura o mercadinho vinculado ao comerciante logado (idUsuario)
        const meuMercadinho = listaMercadinhos.find((m) => {
          const comId = m.comercianteId || m.comerdante_id || m.idComerciante || m.usuario?.idUsuario || m.comerciante?.idUsuario || m.comerciante?.id;
          return Number(comId) === Number(idUsuario);
        });

        if (meuMercadinho) {
          idMercadinho = meuMercadinho.idMercadinho || meuMercadinho.id;
          console.log('✅ [AUTH] Mercadinho vinculado localizado com sucesso. ID:', idMercadinho);
        }
      } catch (err) {
        console.warn('⚠️ Não foi possível carregar idMercadinho automaticamente:', err);
      }
    }

    const userData = { email, idUsuario, nome, perfil, idMercadinho };

    setUser(userData);

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
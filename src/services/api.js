import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
  timeout: 10000,
});

// Variável para armazenar a função de logout do AuthContext
let unauthorizedCallback = null;

// Função chamada pelo AuthContext para registrar o callback
export const registerAuthErrorHandler = (callback) => {
  unauthorizedCallback = callback;
};

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      // Evita loops se a própria rota de login retornar 401
      if (!originalRequest.url.includes('/api/auth/login')) {
        try {
          // 1. Limpa o armazenamento local
          await AsyncStorage.removeItem('@AppNaEsquina:token');
          await AsyncStorage.removeItem('@AppNaEsquina:user');
          delete api.defaults.headers.common['Authorization'];

          // 2. Se o callback estiver registado, executa-o para atualizar o estado do React instantaneamente
          if (unauthorizedCallback) {
            unauthorizedCallback();
          }
        } catch (e) {
          console.log('Erro ao processar expiração de sessão:', e);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
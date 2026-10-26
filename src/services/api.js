import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Substitua pelo IP local da sua máquina se mudar de rede
const IP_MAQUINA = '192.168.100.14';
const PORTA_BACKEND = '8080';

// No navegador Web usa localhost; no dispositivo móvel usa o IP da máquina na rede local
const API_URL = Platform.OS === 'web'
  ? `http://localhost:${PORTA_BACKEND}`
  : `http://${IP_MAQUINA}:${PORTA_BACKEND}`;

const api = axios.create({
  baseURL: API_URL, 
  timeout: 10000,
});

// Interceptor para enviar o Token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@AppNaEsquina:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variável para armazenar a função de logout do AuthContext
let unauthorizedCallback = null;

// Função chamada pelo AuthContext para registrar o callback
export const registerAuthErrorHandler = (callback) => {
  unauthorizedCallback = callback;
};

// Interceptor de Resposta (Tratamento de 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      // Evita loops se a própria rota de login retornar 401
      if (!originalRequest.url?.includes('/api/auth/login')) {
        try {
          // 1. Limpa o armazenamento local
          await AsyncStorage.removeItem('@AppNaEsquina:token');
          await AsyncStorage.removeItem('@AppNaEsquina:user');
          delete api.defaults.headers.common['Authorization'];

          // 2. Executa o callback para deslogar no React
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
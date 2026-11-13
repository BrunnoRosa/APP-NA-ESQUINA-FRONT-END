import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// IP do computador que roda o back-end, usado só pelo app no celular (Expo Go).
// Para mudar sem mexer no código: crie o arquivo .env.local com
//   EXPO_PUBLIC_API_IP=192.168.0.10
// (o .env.local não vai para o GitHub). Se não existir, usa o IP padrão abaixo.
const IP_PADRAO = '192.168.100.14';
const IP_MAQUINA = process.env.EXPO_PUBLIC_API_IP || IP_PADRAO;
const PORTA_BACKEND = '8080';

// Escolhe o endereço do back-end:
//  - Navegador no próprio computador (localhost:8082)  -> localhost
//  - Navegador em outro aparelho (ex.: Safari no iPhone abrindo http://IP:8082)
//    -> o mesmo IP que está na barra de endereço, com a porta do back-end
//  - App no celular (Expo Go)                          -> IP do .env.local ou padrão
function descobrirHost() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }
  return IP_MAQUINA;
}

// Produção (Railway): defina EXPO_PUBLIC_API_URL com o endereço público do back-end,
// ex.: https://na-esquina-back.up.railway.app  (sem barra no final).
// Se não existir, usa o modo desenvolvimento (descobrirHost + porta 8080).
const URL_PRODUCAO = (process.env.EXPO_PUBLIC_API_URL || 'https://app-na-esquina-back-end-production.up.railway.app').trim().replace(/\/+$/, '');
const API_URL = URL_PRODUCAO || `http://${descobrirHost()}:${PORTA_BACKEND}`;

const api = axios.create({
  baseURL: API_URL, 
  timeout: 10000,
});

// Interceptor para enviar o Token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@AppNaEsquina:token');
    if (token) {
      // Remove aspas extras caso tenham sido salvas junto com a String no AsyncStorage
      const tokenFormatado = token.replace(/^"(.*)"$/, '$1').trim();
      config.headers.Authorization = `Bearer ${tokenFormatado}`;
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
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Contextos
import { CarrinhoProvider } from './src/context/CarrinhoContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Componente Customizado do TabBar
import TabNavigator from './src/components/Layout/TabNavigator';

// Telas de Autenticação
import Login from './src/pages/auth/Login';
import Cadastro from './src/pages/auth/Cadastro';
import RecuperarSenha from './src/pages/auth/RecuperarSenha';

// Telas do Cliente
import HomeCliente from './src/pages/cliente/HomeCliente';
import BuscarProdutos from './src/pages/cliente/BuscarProdutos';
import MeusPedidos from './src/pages/cliente/MeusPedidos';
import DetalhesMercadinho from './src/pages/cliente/DetalhesMercadinho';
import Carrinho from './src/pages/cliente/Carrinho';

// Telas do Comerciante
import DashboardComerciante from './src/pages/comerciante/DashboardComerciante';
import GerenciarProdutos from './src/pages/comerciante/GerenciarProdutos';
import GerenciarPedidos from './src/pages/comerciante/GerenciarPedidos';
import GerenciarVitrine from './src/pages/comerciante/GerenciarVitrine';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Navegação por Abas do Cliente
function ClienteTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabNavigator {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeCliente" component={HomeCliente} />
      <Tab.Screen name="BuscarProdutos" component={BuscarProdutos} />
      <Tab.Screen name="MeusPedidos" component={MeusPedidos} />
    </Tab.Navigator>
  );
}

// 2. Navegação por Abas do Comerciante
function ComercianteTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabNavigator {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardComerciante" component={DashboardComerciante} />
      <Tab.Screen name="GerenciarProdutos" component={GerenciarProdutos} />
      <Tab.Screen name="GerenciarPedidos" component={GerenciarPedidos} />
      <Tab.Screen name="GerenciarVitrine" component={GerenciarVitrine} />
    </Tab.Navigator>
  );
}

// 3. Estrutura Geral de Rotas
function Routes() {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!signed ? (
          // Rotas Públicas
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
          </>
        ) : user?.perfil === 'COMERCIANTE' ? (
          // Rotas do Comerciante com Abas
          <>
            <Stack.Screen name="ComercianteTabs" component={ComercianteTabs} />
          </>
        ) : (
          // Rotas do Cliente (Abas + Telas secundárias sem aba cobrindo a tela)
          <>
            <Stack.Screen name="ClienteTabs" component={ClienteTabs} />
            <Stack.Screen name="DetalhesMercadinho" component={DetalhesMercadinho} />
            <Stack.Screen name="Carrinho" component={Carrinho} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Routes />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
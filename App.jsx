import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Contextos
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CarrinhoProvider } from './src/context/CarrinhoContext';

// Componente Customizado do TabBar
import TabNavigator from './src/components/Layout/TabNavigator';

// Telas de Autenticação
import Abertura from './src/pages/auth/Abertura';
import Cadastro from './src/pages/auth/Cadastro';
import Login from './src/pages/auth/Login';
import RecuperarSenha from './src/pages/auth/RecuperarSenha';

// Telas do Cliente
import BuscarProdutos from './src/pages/cliente/BuscarProdutos';
import Carrinho from './src/pages/cliente/Carrinho';
import Conta from './src/pages/cliente/Conta';
import DetalhesMercadinho from './src/pages/cliente/DetalhesMercadinho';
import HomeCliente from './src/pages/cliente/HomeCliente';
import MeusPedidos from './src/pages/cliente/MeusPedidos';

// Telas do Comerciante
import AtivarProdutoCatalogo from './src/pages/comerciante/AtivarProdutoCatalogo'; // <-- NOVO IMPORT
import DashboardComerciante from './src/pages/comerciante/DashboardComerciante';
import GerenciarPedidos from './src/pages/comerciante/GerenciarPedidos';
import GerenciarProdutos from './src/pages/comerciante/GerenciarProdutos';
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
      <Tab.Screen name="Conta" component={Conta} />
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
            <Stack.Screen name="Abertura" component={Abertura} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
          </>
        ) : user?.perfil === 'COMERCIANTE' ? (
          // Rotas do Comerciante (Abas + Telas secundárias)
          <>
            <Stack.Screen name="ComercianteTabs" component={ComercianteTabs} />
            <Stack.Screen name="AtivarProdutoCatalogo" component={AtivarProdutoCatalogo} />
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
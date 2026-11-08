import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  useWindowDimensions,
  View,
} from "react-native";

// Contextos
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { CarrinhoProvider } from "./src/context/CarrinhoContext";
import { PedidosPendentesProvider } from "./src/context/PedidosPendentesContext";
import { ToastProvider } from "./src/context/ToastContext";

// Componente Customizado do TabBar
import TabNavigator from "./src/components/Layout/TabNavigator";

// Tela compartilhada
import EditarPerfil from "./src/pages/comum/EditarPerfil"; // 🆕

// Telas de Autenticação
import Abertura from "./src/pages/auth/Abertura";
import Cadastro from "./src/pages/auth/Cadastro";
import Login from "./src/pages/auth/Login";
import RecuperarSenha from "./src/pages/auth/RecuperarSenha";

// Telas do Cliente
import BuscarProdutos from "./src/pages/cliente/BuscarProdutos";
import Carrinho from "./src/pages/cliente/Carrinho";
import Conta from "./src/pages/cliente/Conta";
import DetalhesMercadinho from "./src/pages/cliente/DetalhesMercadinho";
import Favoritos from "./src/pages/cliente/Favoritos";
import HomeCliente from "./src/pages/cliente/HomeCliente";
import MeusPedidos from "./src/pages/cliente/MeusPedidos";

// Telas do Comerciante
import AtivarProdutoCatalogo from "./src/pages/comerciante/AtivarProdutoCatalogo";
import DashboardComerciante from "./src/pages/comerciante/DashboardComerciante";
import GerenciarPedidos from "./src/pages/comerciante/GerenciarPedidos";
import GerenciarProdutos from "./src/pages/comerciante/GerenciarProdutos";
import GerenciarVitrine from "./src/pages/comerciante/GerenciarVitrine";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Navegação por Abas do Cliente
function ClienteTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <Tab.Navigator
      tabBar={(props) => <TabNavigator {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? "left" : "bottom",
        tabBarVariant: isDesktop ? "material" : "uikit",
        sceneStyle: { flex: 1 },
      }}
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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <Tab.Navigator
      tabBar={(props) => <TabNavigator {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? "left" : "bottom",
        tabBarVariant: isDesktop ? "material" : "uikit",
        sceneStyle: { flex: 1 },
      }}
    >
      <Tab.Screen
        name="DashboardComerciante"
        component={DashboardComerciante}
      />
      <Tab.Screen name="GerenciarProdutos" component={GerenciarProdutos} />
      <Tab.Screen name="GerenciarPedidos" component={GerenciarPedidos} />
      <Tab.Screen name="GerenciarVitrine" component={GerenciarVitrine} />
    </Tab.Navigator>
  );
}

// 3. Estrutura Geral de Rotas

function Routes() {
  const { signed, user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const estiloConteudoDesktop = signed && width >= 900
    ? { flex: 1, width: "100%", maxWidth: 1600, alignSelf: "center" }
    : undefined;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const navegacao = (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: estiloConteudoDesktop,
        }}
      >
        {!signed ? (
          <>
            <Stack.Screen name="Abertura" component={Abertura} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
            <Stack.Screen name="RecuperarSenha" component={RecuperarSenha} />
          </>
        ) : user?.perfil === "COMERCIANTE" ? (
          <>
            <Stack.Screen name="ComercianteTabs" component={ComercianteTabs} />
            <Stack.Screen
              name="AtivarProdutoCatalogo"
              component={AtivarProdutoCatalogo}
            />
            <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
          </>
        ) : (
          <>
            <Stack.Screen name="ClienteTabs" component={ClienteTabs} />
            <Stack.Screen
              name="DetalhesMercadinho"
              component={DetalhesMercadinho}
            />
            <Stack.Screen name="Favoritos" component={Favoritos} />
            <Stack.Screen name="Carrinho" component={Carrinho} />
            <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );

  // O app ocupa a janela inteira em qualquer dispositivo.
  // A adaptação entre celular e computador acontece na navegação e nas telas.
  return navegacao;
}

export default function App() {
  return (
    // ToastProvider por fora de tudo: o aviso sobrevive à troca de tela
    <ToastProvider>
      <AuthProvider>
        <PedidosPendentesProvider>
          <CarrinhoProvider>
            <Routes />
          </CarrinhoProvider>
        </PedidosPendentesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

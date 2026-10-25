import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../../theme';

// Cada tela tem um ícone base. Fora da aba ativa usamos a versão "-outline" (só contorno).
const ICONES = {
  HomeCliente: 'home',
  BuscarProdutos: 'search',
  MeusPedidos: 'receipt',
  DashboardComerciante: 'stats-chart',
  GerenciarProdutos: 'cube',
  GerenciarPedidos: 'receipt',
  GerenciarVitrine: 'star',
};

export default function TabNavigator({ state, descriptors, navigation }) {
   const getTabIcon = (routeName, focused) => {
    const base = ICONES[routeName] || 'home';
    return focused ? base : `${base}-outline`;
  };
  
  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'HomeCliente':
        return 'Início';
      case 'BuscarProdutos':
        return 'Pesquisar';
      case 'MeusPedidos':
        return 'Pedidos';
      case 'DashboardComerciante':
        return 'Painel';
      case 'GerenciarProdutos':
        return 'Produtos';
      case 'GerenciarPedidos':
        return 'Pedidos';
      case 'GerenciarVitrine':
        return 'Destaques';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Ionicons
              name={getTabIcon(route.name, isFocused)}
              size={24}
              color={isFocused ? cores.textoAtivo : cores.textoInativo}
            />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {getTabLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
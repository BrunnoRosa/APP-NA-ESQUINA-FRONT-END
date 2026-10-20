import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function TabNavigator({ state, descriptors, navigation }) {
  const getTabIcon = (routeName) => {
    switch (routeName) {
      case 'HomeCliente':
        return '🏪';
      case 'BuscarProdutos':
        return '🔍';
      case 'MeusPedidos':
        return '📋';
      case 'DashboardComerciante':
        return '📊';
      case 'GerenciarProdutos':
        return '📦';
      case 'GerenciarPedidos':
        return '🚚';
      case 'GerenciarVitrine':
        return '⭐';
      default:
        return '🏠';
    }
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'HomeCliente':
        return 'Início';
      case 'BuscarProdutos':
        return 'Buscar';
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
            <Text style={styles.tabIcon}>{getTabIcon(route.name)}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {getTabLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { styles } from './styles';

import { Ionicons } from '@expo/vector-icons';
import { usePedidosPendentes } from '../../../context/PedidosPendentesContext';
import { cores } from '../../../theme';

// Cada tela tem um ícone base. Fora da aba ativa usamos a versão "-outline".
const ICONES = {
  HomeCliente: 'home',
  BuscarProdutos: 'search',
  MeusPedidos: 'receipt',
  DashboardComerciante: 'stats-chart',
  GerenciarProdutos: 'cube',
  GerenciarPedidos: 'receipt',
  GerenciarVitrine: 'star',
  Conta: 'person',
};

export default function TabNavigator({ state, descriptors, navigation }) {
  const { width } = useWindowDimensions();
  const { pendentes } = usePedidosPendentes();
  const textoSelo = pendentes > 99 ? '99+' : String(pendentes);
  const isDesktop = width >= 900;
  const isMerchant = state.routes.some((route) =>
    ['DashboardComerciante', 'GerenciarProdutos', 'GerenciarPedidos', 'GerenciarVitrine'].includes(route.name)
  );

  const getTabIcon = (routeName, focused) => {
    const base = ICONES[routeName] || 'home';
    return focused ? base : `${base}-outline`;
  };

  const getTabLabel = (routeName) => {
    switch (routeName) {
      case 'HomeCliente': return 'Início';
      case 'BuscarProdutos': return 'Pesquisar';
      case 'MeusPedidos': return 'Pedidos';
      case 'DashboardComerciante': return 'Painel';
      case 'GerenciarProdutos': return 'Produtos';
      case 'GerenciarPedidos': return 'Pedidos';
      case 'GerenciarVitrine': return 'Destaques';
      case 'Conta': return 'Conta';
      default: return routeName;
    }
  };

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {isDesktop && (
        <View style={styles.brandArea}>
          <View style={styles.brandIcon}>
            <Ionicons name="storefront" size={25} color="#FFFFFF" />
          </View>
          <View style={styles.brandTextArea}>
            <Text style={styles.brandName}>Na Esquina</Text>
            <Text style={styles.brandSubtitle}>
              {isMerchant ? 'Painel do comerciante' : 'Perto de você'}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.itemsContainer, isDesktop && styles.itemsContainerDesktop]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          // Selo com a quantidade de pedidos esperando o comerciante
          const mostrarSelo = route.name === 'GerenciarPedidos' && pendentes > 0;

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
              accessibilityLabel={
                mostrarSelo ? `Pedidos, ${pendentes} aguardando` : options.tabBarAccessibilityLabel
              }
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isDesktop && styles.tabItemDesktop,
                isDesktop && isFocused && styles.tabItemDesktopActive,
              ]}
            >
              <View style={styles.iconeArea}>
                <Ionicons
                  name={getTabIcon(route.name, isFocused)}
                  size={isDesktop ? 21 : 24}
                  color={isFocused ? cores.primaria : cores.textoInativo}
                />
                {mostrarSelo && !isDesktop && (
                  <View style={styles.selo}>
                    <Text style={styles.seloTexto}>{textoSelo}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive,
                  isDesktop && styles.tabLabelDesktop,
                  isDesktop && isFocused && styles.tabLabelDesktopActive,
                ]}
              >
                {getTabLabel(route.name)}
              </Text>
              {mostrarSelo && isDesktop && (
                <View style={styles.seloDesktop}>
                  <Text style={styles.seloTexto}>{textoSelo}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isDesktop && (
        <View style={styles.sidebarFooter}>
          <Text style={styles.sidebarFooterTitle}>Na Esquina</Text>
          <Text style={styles.sidebarFooterText}>Conectando você ao comércio local.</Text>
        </View>
      )}
    </View>
  );
}

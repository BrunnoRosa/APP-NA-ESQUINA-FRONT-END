import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useCarrinho } from '../../../context/CarrinhoContext';
import { styles } from './styles';

export default function Header({ navigation, title }) {
  const auth = useAuth();
  const { user, signOut } = auth || {};
  
  const carrinhoContext = useCarrinho ? useCarrinho() : null;
  const totalItens = carrinhoContext?.totalItens || 0;

  const isComerciante = user?.perfil === 'COMERCIANTE';

  const handleLogout = () => {
    if (typeof signOut === 'function') {
      signOut();
    } else {
      console.warn('Função signOut não encontrada no AuthContext.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingText}>
            {isComerciante ? 'Painel Comerciante' : 'Entregar em'}
          </Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {title || user?.nome || user?.email || 'Na Esquina'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {!isComerciante && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Carrinho')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>🛒</Text>
              {totalItens > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItens}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(220, 53, 69, 0.3)' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isComerciante && (
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => navigation.navigate('ClienteTabs', { screen: 'HomeCliente' })}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 12 }}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            Mercadinhos no seu bairro
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { cores } from '../theme';

const LIMITE = 55; // quanto precisa "esticar" (já com resistência) para atualizar
const MAXIMO = 90;

// "Puxar para atualizar".
//  - No celular (app): usa o RefreshControl nativo.
//  - Na web (Safari/Chrome no celular): detecta o gesto de esticar a tela para baixo
//    quando a lista está no topo e mostra um indicador redondo.
// Uso:
//   const pull = usePuxarParaAtualizar(carregarDados);
//   <View style={styles.container}>
//     {pull.indicador}
//     <FlatList {...pull.props} ... />
export function usePuxarParaAtualizar(aoAtualizar) {
  const [atualizando, setAtualizando] = useState(false);
  const [puxada, setPuxada] = useState(0);
  const noTopo = useRef(true);
  const inicioY = useRef(null);

  const executar = useCallback(async () => {
    if (atualizando) return;
    setAtualizando(true);
    try {
      await aoAtualizar();
    } catch (e) {}
    setAtualizando(false);
  }, [aoAtualizar, atualizando]);

  const props = {
    scrollEventThrottle: 16,
    onScroll: (e) => {
      noTopo.current = e.nativeEvent.contentOffset.y <= 0;
    },
  };

  if (Platform.OS === 'web') {
    props.onTouchStart = (e) => {
      const toque = e.nativeEvent.touches && e.nativeEvent.touches[0];
      inicioY.current = noTopo.current && !atualizando && toque ? toque.pageY : null;
    };
    props.onTouchMove = (e) => {
      if (inicioY.current === null) return;
      const toque = e.nativeEvent.touches && e.nativeEvent.touches[0];
      if (!toque) return;
      const distancia = (toque.pageY - inicioY.current) * 0.6; // resistência
      setPuxada(distancia > 0 ? Math.min(distancia, MAXIMO) : 0);
    };
    props.onTouchEnd = () => {
      if (inicioY.current === null) return;
      inicioY.current = null;
      const atingiu = puxada >= LIMITE;
      setPuxada(0);
      if (atingiu) executar();
    };
  } else {
    props.refreshControl = (
      <RefreshControl
        refreshing={atualizando}
        onRefresh={executar}
        colors={[cores.primaria || '#FF3131']}
        tintColor={cores.primaria || '#FF3131'}
      />
    );
  }

  const visivel = Platform.OS === 'web' && (puxada > 0 || atualizando);
  const pronto = puxada >= LIMITE;
  const indicador = visivel ? (
    <View
      pointerEvents="none"
      style={[styles.bolha, { top: 10 + (atualizando ? LIMITE * 0.5 : puxada * 0.5) }]}
    >
      {atualizando ? (
        <ActivityIndicator size="small" color={cores.primaria || '#FF3131'} />
      ) : (
        <Ionicons
          name="arrow-down"
          size={18}
          color={cores.primaria || '#FF3131'}
          style={{ transform: [{ rotate: pronto ? '180deg' : '0deg' }] }}
        />
      )}
    </View>
  ) : null;

  return { props, indicador, atualizando };
}

const styles = StyleSheet.create({
  bolha: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});

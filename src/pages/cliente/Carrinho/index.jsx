import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';          // 🆕
import { Ionicons } from '@expo/vector-icons';                  // 🆕
import { useCarrinho } from '../../../context/CarrinhoContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { cores } from '../../../theme';                         // 🆕
import { styles } from './styles';

// 🆕 Formata número como moeda brasileira (usado em 3 lugares)
function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function Carrinho({ navigation }) {
  const context = useCarrinho();

  // Garantia contra desestruturação nula
  const itens = context?.itens || context?.carrinho || [];
  const valorTotal = context?.valorTotal || 0;
  const idMercadinhoContext = context?.idMercadinho;
  const adicionarAoCarrinho = context?.adicionarAoCarrinho;
  const removerDoCarrinho = context?.removerDoCarrinho;
  const removerItemCompleto = context?.removerItemCompleto;     // 🆕
  const limparCarrinho = context?.limparCarrinho;

  const { user } = useAuth();
  const [enviando, setEnviando] = useState(false);

  // 🆕 Soma das quantidades, para mostrar "N itens"
  const totalUnidades = itens.reduce(
    (soma, item) => soma + (item?.quantidade || 1),
    0
  );

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  const finalizarPedido = async () => {
    if (!itens || itens.length === 0) return;

    const idCliente = user?.idUsuario || user?.id;

    const primeiroItem = itens[0];
    const idMercadinho =
      idMercadinhoContext ||
      primeiroItem?.idMercadinho ||
      primeiroItem?.mercadinhoId ||
      primeiroItem?.mercadinho?.idMercadinho ||
      primeiroItem?.mercadinho?.id;

    if (!idMercadinho) {
      exibirAlerta(
        'Erro no Pedido',
        'Não foi possível identificar o mercadinho deste pedido. Recarregue a página e tente novamente.'
      );
      return;
    }

    if (!idCliente) {
      exibirAlerta(
        'Erro no Pedido',
        'Usuário não identificado. Por favor, faça login novamente.'
      );
      return;
    }

    const payload = {
      idCliente: Number(idCliente),
      idMercadinho: Number(idMercadinho),
      itens: itens.map((item) => ({
        idProduto: Number(item?.idProduto || item?.id),
        quantidade: item?.quantidade || 1,
      })),
    };

    setEnviando(true);

    try {
      await api.post('/api/pedidos', payload);
      if (limparCarrinho) limparCarrinho();
      exibirAlerta(
        'Pedido Realizado! 🎉',
        'Seu pedido foi enviado ao mercadinho e já está sendo processado.'
      );
      navigation.navigate('ClienteTabs', { screen: 'MeusPedidos' });
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error?.response?.data || error);
      exibirAlerta('Erro', 'Não foi possível enviar o seu pedido. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // ✏️ Visual novo a partir daqui
  const carrinhoVazio = !itens || itens.length === 0;

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê amarelo */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
          </TouchableOpacity>

          <View>
            <Text style={styles.titulo}>Meu carrinho</Text>
            {!carrinhoVazio && (
              <Text style={styles.subtitulo}>
                {totalUnidades} {totalUnidades === 1 ? 'item' : 'itens'}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        {carrinhoVazio ? (
          <View style={styles.vazioContainer}>
            <View style={styles.vazioCirculo}>
              <Ionicons name="cart-outline" size={44} color={cores.primaria} />
            </View>
            <Text style={styles.vazioTitulo}>Seu carrinho está vazio</Text>
            <Text style={styles.vazioSubtitulo}>
              Adicione produtos para realizar seu pedido.
            </Text>
            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoPrimarioTexto}>Voltar às compras</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={itens}
              keyExtractor={(item, index) =>
                String(item?.idProduto || item?.id || index)
              }
              contentContainerStyle={styles.lista}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const idItem = item?.idProduto || item?.id;

                return (
                  <View style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemNome} numberOfLines={2}>
                        {item?.nome || 'Produto'}
                      </Text>
                      <Text style={styles.itemPreco}>
                        {formatarMoeda(item?.preco)}
                      </Text>
                    </View>

                    <View style={styles.itemAcoes}>
                      {/* 🆕 Lixeira: remove o item inteiro */}
                      <TouchableOpacity
                        onPress={() => removerItemCompleto && removerItemCompleto(idItem)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={cores.textoInativo} />
                      </TouchableOpacity>

                      <View style={styles.qtdControls}>
                        <TouchableOpacity
                          style={styles.btnQtd}
                          onPress={() => removerDoCarrinho && removerDoCarrinho(idItem)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="remove" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.qtdText}>{item?.quantidade || 1}</Text>
                        <TouchableOpacity
                          style={styles.btnQtd}
                          onPress={() => adicionarAoCarrinho && adicionarAoCarrinho(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            />

            {/* ✏️ Rodapé com resumo e botão */}
            <View style={styles.rodape}>
              <View style={styles.totalLinha}>
                <Text style={styles.totalRotulo}>Total do pedido</Text>
                <Text style={styles.totalValor}>{formatarMoeda(valorTotal)}</Text>
              </View>

              {enviando ? (
                <ActivityIndicator size="large" color={cores.primaria} />
              ) : (
                <TouchableOpacity
                  style={styles.botaoPrimario}
                  onPress={finalizarPedido}
                  activeOpacity={0.85}
                >
                  <Text style={styles.botaoPrimarioTexto}>Confirmar pedido</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
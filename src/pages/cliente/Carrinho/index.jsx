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
import { useCarrinho } from '../../../context/CarrinhoContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function Carrinho({ navigation }) {
  const context = useCarrinho();
  
  // Garantia contra desestruturação nula
  const itens = context?.itens || context?.carrinho || [];
  const valorTotal = context?.valorTotal || 0;
  const idMercadinhoContext = context?.idMercadinho;
  const adicionarAoCarrinho = context?.adicionarAoCarrinho;
  const removerDoCarrinho = context?.removerDoCarrinho;
  const limparCarrinho = context?.limparCarrinho;

  const { user } = useAuth();
  const [enviando, setEnviando] = useState(false);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meu Carrinho 🛒</Text>
      </View>

      {!itens || itens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtitle}>
            Adicione produtos para realizar seu pedido.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={itens}
            keyExtractor={(item, index) =>
              String(item?.idProduto || item?.id || index)
            }
            style={styles.content}
            renderItem={({ item }) => {
              const precoNum = Number(item?.preco || 0);
              const precoItem = precoNum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });

              return (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNome}>{item?.nome || 'Produto'}</Text>
                    <Text style={styles.itemPreco}>{precoItem}</Text>
                  </View>

                  <View style={styles.qtdControls}>
                    <TouchableOpacity
                      style={styles.btnQtd}
                      onPress={() =>
                        removerDoCarrinho &&
                        removerDoCarrinho(item?.idProduto || item?.id)
                      }
                    >
                      <Text style={styles.btnQtdText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtdText}>{item?.quantidade || 1}</Text>
                    <TouchableOpacity
                      style={styles.btnQtd}
                      onPress={() =>
                        adicionarAoCarrinho && adicionarAoCarrinho(item)
                      }
                    >
                      <Text style={styles.btnQtdText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total do Pedido:</Text>
              <Text style={styles.totalValor}>
                {Number(valorTotal || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
            </View>

            {enviando ? (
              <ActivityIndicator size="large" color="#28A745" />
            ) : (
              <TouchableOpacity
                style={styles.btnFinalizar}
                onPress={finalizarPedido}
              >
                <Text style={styles.btnFinalizarText}>
                  Confirmar e Fazer Pedido 🙌
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}
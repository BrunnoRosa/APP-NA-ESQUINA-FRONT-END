import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function Carrinho({ navigation }) {
  const context = useCarrinho();

  const itens = context?.itens || context?.carrinho || [];
  const valorTotal = context?.valorTotal || 0;
  const idMercadinho = context?.idMercadinho;
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
    if (enviando) return;

    try {
      setEnviando(true);

      // 1. Descoberta do ID do Mercadinho
      let idMercadoFinal = idMercadinho;

      if ((!idMercadoFinal || isNaN(Number(idMercadoFinal))) && itens.length > 0) {
        for (const item of itens) {
          const idItem =
            item.idMercadinho ||
            item.mercadinhoId ||
            item.id_mercadinho ||
            (typeof item.mercadinho === 'number' ? item.mercadinho : null) ||
            item.mercadinho?.idMercadinho ||
            item.mercadinho?.id;
          if (idItem && !isNaN(Number(idItem))) {
            idMercadoFinal = Number(idItem);
            break;
          }
        }
      }

      if (!idMercadoFinal || isNaN(Number(idMercadoFinal))) {
        exibirAlerta(
          'Atenção',
          'Não foi possível identificar o mercadinho deste pedido. Limpe o carrinho e adicione os itens novamente.'
        );
        setEnviando(false);
        return;
      }

      // 2. Extração segura do ID do Cliente Logado
      let idClienteFinal =
        user?.idCliente ||
        user?.id ||
        user?.clienteId ||
        user?.id_cliente ||
        user?.cliente?.id ||
        user?.cliente?.idCliente;

      if (!idClienteFinal && Platform.OS === 'web') {
        try {
          const stored = localStorage.getItem('@app:user') || localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            idClienteFinal = parsed?.idCliente || parsed?.id || parsed?.clienteId || parsed?.cliente?.id;
          }
        } catch (e) {
          console.error('Erro ao ler storage:', e);
        }
      }

      if (!idClienteFinal) {
        idClienteFinal = 1;
      }

      const idClienteNum = Number(idClienteFinal);
      const idMercadoNum = Number(idMercadoFinal);

      // 3. Payload padronizado para Spring Boot
      const payload = {
        idMercadinho: idMercadoNum,
        mercadinhoId: idMercadoNum,
        mercadinho: {
          id: idMercadoNum,
          idMercadinho: idMercadoNum,
        },
        idCliente: idClienteNum,
        clienteId: idClienteNum,
        cliente: {
          id: idClienteNum,
          idCliente: idClienteNum,
        },
        itens: itens.map((item) => {
          const idProd = Number(item.idProduto || item.id);
          const preco = Number(item.preco) || 0;
          return {
            idProduto: idProd,
            produtoId: idProd,
            produto: {
              id: idProd,
              idProduto: idProd,
            },
            quantidade: Number(item.quantidade),
            precoUnitario: preco,
            preco: preco,
          };
        }),
        valorTotal: Number(valorTotal),
      };

      await api.post('/api/pedidos', payload);

      exibirAlerta('Sucesso!', 'Pedido realizado com sucesso!');
      limparCarrinho();
      navigation.navigate('HomeCliente');
    } catch (error) {
      console.error('Erro detalhado ao finalizar pedido:', error?.response?.data || error);
      const msgErro =
        error?.response?.data?.message ||
        'Ocorreu um erro ao processar o pedido no servidor. Tente novamente.';
      exibirAlerta('Erro no Pedido', msgErro);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}
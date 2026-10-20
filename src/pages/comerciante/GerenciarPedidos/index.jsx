import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function GerenciarPedidos({ navigation }) {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState(null);

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  // Define parâmetro isSilent para atualização em segundo plano sem piscar tela
  const carregarPedidos = useCallback(async (isSilent = false) => {
    const idMercadinho = user?.idMercadinho || user?.id || 1;

    try {
      if (!isSilent) setLoading(true);
      const response = await api.get(`/api/pedidos/mercadinho/${idMercadinho}`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos do mercadinho:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user]);

  // Executa o Polling a cada 5 segundos enquanto a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      carregarPedidos();

      const intervalId = setInterval(() => {
        carregarPedidos(true); // Requisição silenciosa em background
      }, 5000);

      return () => clearInterval(intervalId); // Limpa o temporizador ao sair
    }, [carregarPedidos])
  );

  const alterarStatus = async (idPedido, novoStatus) => {
    setAtualizandoId(idPedido);
    try {
      await api.put(`/api/pedidos/${idPedido}/status?status=${novoStatus}`);
      exibirAlerta('Status Atualizado', `Pedido #${idPedido} atualizado para ${novoStatus}.`);
      carregarPedidos(true);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      exibirAlerta('Erro', 'Não foi possível alterar o status do pedido.');
    } finally {
      setAtualizandoId(null);
    }
  };

  function getStatusStyle(status) {
    switch (status) {
      case 'PENDENTE':
        return { bg: '#FFF3CD', text: '#856404' };
      case 'EM_PREPARO':
        return { bg: '#CCE5FF', text: '#004085' };
      case 'SAIU_PARA_ENTREGA':
        return { bg: '#E2E3E5', text: '#383D41' };
      case 'CONCLUIDO':
        return { bg: '#D4EDDA', text: '#155724' };
      case 'CANCELADO':
        return { bg: '#F8D7DA', text: '#721C24' };
      default:
        return { bg: '#E2E3E5', text: '#383D41' };
    }
  }

  function renderPedido({ item }) {
    const statusStyle = getStatusStyle(item.status);
    const isBusy = atualizandoId === item.idPedido;

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <Text style={styles.pedidoNumero}>Pedido #{item.idPedido}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.clienteEmail}>
          👤 Cliente: {item.cliente?.nome || item.cliente?.email || 'Cliente'}
        </Text>

        <View style={styles.divider} />

        {item.itens?.map((it) => (
          <View key={String(it.idItemPedido)} style={styles.itemRow}>
            <Text style={styles.itemNome}>
              {it.quantidade}x {it.produto?.nome}
            </Text>
            <Text style={styles.itemPreco}>
              {Number(it.precoUnitario * it.quantidade).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        ))}

        <View style={styles.pedidoFooter}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValor}>
            {Number(item.valorTotal || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        {isBusy ? (
          <ActivityIndicator style={{ marginTop: 12 }} size="small" color="#007BFF" />
        ) : (
          <View style={styles.actionContainer}>
            {item.status === 'PENDENTE' && (
              <>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: '#007BFF' }]}
                  onPress={() => alterarStatus(item.idPedido, 'EM_PREPARO')}
                >
                  <Text style={styles.btnText}>👨‍🍳 Em Preparo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: '#DC3545' }]}
                  onPress={() => alterarStatus(item.idPedido, 'CANCELADO')}
                >
                  <Text style={styles.btnText}>❌ Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === 'EM_PREPARO' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#17A2B8' }]}
                onPress={() => alterarStatus(item.idPedido, 'SAIU_PARA_ENTREGA')}
              >
                <Text style={styles.btnText}>🛵 Saiu p/ Entrega</Text>
              </TouchableOpacity>
            )}

            {item.status === 'SAIU_PARA_ENTREGA' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#28A745' }]}
                onPress={() => alterarStatus(item.idPedido, 'CONCLUIDO')}
              >
                <Text style={styles.btnText}>✅ Marcar Concluído</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Pedidos 📦</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum pedido recebido</Text>
          <Text style={styles.emptySubtitle}>Os pedidos dos clientes aparecerão aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.idPedido)}
          renderItem={renderPedido}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
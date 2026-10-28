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

  useFocusEffect(
    useCallback(() => {
      carregarPedidos();

      const intervalId = setInterval(() => {
        carregarPedidos(true);
      }, 5000);

      return () => clearInterval(intervalId);
    }, [carregarPedidos])
  );

  const alterarStatus = async (idPedido, novoStatus, motivo = '') => {
    setAtualizandoId(idPedido);
    try {
      let url = `/api/pedidos/${idPedido}/status?status=${novoStatus}`;
      if (motivo.trim() !== '') {
        url += `&motivo=${encodeURIComponent(motivo.trim())}`;
      }

      await api.put(url);
      exibirAlerta('Status Atualizado', `Pedido #${idPedido} atualizado com sucesso!`);
      carregarPedidos(true);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      exibirAlerta('Erro', 'Não foi possível alterar o status do pedido.');
    } finally {
      setAtualizandoId(null);
    }
  };

  const solicitarCancelamento = (idPedido) => {
    if (Platform.OS === 'web') {
      const motivo = window.prompt(
        'Por que deseja cancelar este pedido?\n(Ex: Produto indisponível em estoque)'
      );
      if (motivo !== null) { // Se o usuário não clicou em Cancelar no prompt
        alterarStatus(idPedido, 'CANCELADO', motivo);
      }
    } else {
      Alert.prompt(
        'Cancelar Pedido',
        'Informe o motivo do cancelamento:',
        [
          { text: 'Voltar', style: 'cancel' },
          {
            text: 'Confirmar Cancelamento',
            style: 'destructive',
            onPress: (motivo) => alterarStatus(idPedido, 'CANCELADO', motivo),
          },
        ],
        'plain-text'
      );
    }
  };

  function getStatusInfo(status) {
    switch (status) {
      case 'PENDENTE':
        return { label: 'Aguardando Separação', bg: '#FFF3CD', text: '#856404' };
      case 'EM_SEPARACAO':
        return { label: 'Separando Produtos', bg: '#CCE5FF', text: '#004085' };
      case 'AGUARDANDO_RETIRADA':
        return { label: 'Pronto para Retirada', bg: '#E2E3E5', text: '#383D41' };
      case 'RETIRADA_CONCLUIDO':
        return { label: 'Concluído', bg: '#D4EDDA', text: '#155724' };
      case 'CANCELADO':
        return { label: 'Cancelado', bg: '#F8D7DA', text: '#721C24' };
      default:
        return { label: status, bg: '#E2E3E5', text: '#383D41' };
    }
  }

  function renderPedido({ item }) {
    const statusInfo = getStatusInfo(item.status);
    const isBusy = atualizandoId === item.idPedido;

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <Text style={styles.pedidoNumero}>Pedido #{item.idPedido}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
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

        {item.status === 'CANCELADO' && item.motivoCancelamento && (
          <View style={styles.motivoContainer}>
            <Text style={styles.motivoTitle}>Motivo do cancelamento:</Text>
            <Text style={styles.motivoText}>{item.motivoCancelamento}</Text>
          </View>
        )}

        {isBusy ? (
          <ActivityIndicator style={{ marginTop: 12 }} size="small" color="#007BFF" />
        ) : (
          <View style={styles.actionContainer}>
            {item.status === 'PENDENTE' && (
              <>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: '#007BFF' }]}
                  onPress={() => alterarStatus(item.idPedido, 'EM_SEPARACAO')}
                >
                  <Text style={styles.btnText}>📦 Iniciar Separação</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: '#DC3545' }]}
                  onPress={() => solicitarCancelamento(item.idPedido)}
                >
                  <Text style={styles.btnText}>❌ Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === 'EM_SEPARACAO' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#17A2B8' }]}
                onPress={() => alterarStatus(item.idPedido, 'AGUARDANDO_RETIRADA')}
              >
                <Text style={styles.btnText}>🏪 Disponível para Retirada</Text>
              </TouchableOpacity>
            )}

            {item.status === 'AGUARDANDO_RETIRADA' && (
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#28A745' }]}
                onPress={() => alterarStatus(item.idPedido, 'RETIRADA_CONCLUIDO')}
              >
                <Text style={styles.btnText}>✅ Entregue ao Cliente</Text>
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
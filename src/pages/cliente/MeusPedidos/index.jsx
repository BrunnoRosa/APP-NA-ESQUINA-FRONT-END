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

export default function MeusPedidos({ navigation }) {
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
    const idCliente = user?.idUsuario || user?.id;
    if (!idCliente) return;

    try {
      if (!isSilent) setLoading(true);
      const response = await api.get(`/api/pedidos/cliente/${idCliente}`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
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

  const confirmarRecebimento = async (idPedido) => {
    setAtualizandoId(idPedido);
    try {
      await api.put(`/api/pedidos/${idPedido}/status?status=RETIRADA_CONCLUIDO`);
      exibirAlerta('Pedido Retirado! 🎉', `Obrigado por comprar conosco, volte sempre! #${idPedido}.`);
      carregarPedidos(true);
    } catch (error) {
      console.error('Erro ao confirmar a retirada do pedido:', error);
      exibirAlerta('Erro', 'Não foi possível confirmar a retirada do seu pedido no momento.');
    } finally {
      setAtualizandoId(null);
    }
  };

  function getStatusInfo(status) {
    switch (status) {
      case 'PENDENTE':
        return { label: 'Aguardando Aprovação', bg: '#FFF3CD', text: '#856404' };
      case 'EM_SEPARACAO':
        return { label: 'Em Separação', bg: '#CCE5FF', text: '#004085' };
      case 'AGUARDANDO_RETIRADA':
        return { label: 'Pronto para Retirada', bg: '#E2E3E5', text: '#383D41' };
      case 'RETIRADA_CONCLUIDO':
        return { label: 'Retirado / Concluído', bg: '#D4EDDA', text: '#155724' };
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

        <Text style={styles.mercadinhoNome}>
          🏪 {item.mercadinho?.nomeFantasia || 'Mercadinho'}
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

        {item.status === 'AGUARDANDO_RETIRADA' && (
          isBusy ? (
            <ActivityIndicator style={{ marginTop: 12 }} size="small" color="#28A745" />
          ) : (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => confirmarRecebimento(item.idPedido)}
            >
              <Text style={styles.confirmButtonText}>🛍️ Já Retirei os Produtos</Text>
            </TouchableOpacity>
          )
        )}

        {item.status === 'CANCELADO' && item.motivoCancelamento && (
          <View style={styles.motivoContainer}>
            <Text style={styles.motivoTitle}>Motivo do cancelamento:</Text>
            <Text style={styles.motivoText}>{item.motivoCancelamento}</Text>
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
        <Text style={styles.title}>Meus Pedidos 📋</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtitle}>Você ainda não realizou compras pelo aplicativo.</Text>
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
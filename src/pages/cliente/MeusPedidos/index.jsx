import { Ionicons } from '@expo/vector-icons';                  // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';          // 🆕
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { cores } from '../../../theme';                         // 🆕
import { styles } from './styles';

// 🆕 Formata número como moeda brasileira
function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

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
        return { label: 'Aguardando aprovação', bg: '#FFF3CD', text: '#856404' };
      case 'EM_SEPARACAO':
        return { label: 'Em separação', bg: '#DCEBFF', text: '#1F4E8C' };
      case 'AGUARDANDO_RETIRADA':
        return { label: 'Pronto para retirada', bg: '#FFE9D2', text: '#B25E00' };   // ✏️ laranja: pede ação
      case 'RETIRADA_CONCLUIDO':
        return { label: 'Retirado', bg: '#DDF5D9', text: '#168A00' };               // ✏️
      case 'CANCELADO':
        return { label: 'Cancelado', bg: '#FFE0E0', text: '#C41F1F' };
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

        {/* ✏️ ícone no lugar do emoji */}
        <View style={styles.lojaLinha}>
          <Ionicons name="storefront-outline" size={15} color={cores.textoSecundario} />
          <Text style={styles.mercadinhoNome} numberOfLines={1}>
            {item.mercadinho?.nomeFantasia || 'Mercadinho'}
          </Text>
        </View>

        <View style={styles.divider} />

        {item.itens?.map((it) => (
          <View key={String(it.idItemPedido)} style={styles.itemRow}>
            <Text style={styles.itemNome} numberOfLines={2}>
              {it.quantidade}x {it.produto?.nome}
            </Text>
            <Text style={styles.itemPreco}>
              {formatarMoeda(it.precoUnitario * it.quantidade)}
            </Text>
          </View>
        ))}

        <View style={styles.pedidoFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatarMoeda(item.valorTotal)}</Text>
        </View>

        {item.status === 'AGUARDANDO_RETIRADA' && (
          isBusy ? (
            <ActivityIndicator style={{ marginTop: 12 }} size="small" color={cores.primaria} />
          ) : (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => confirmarRecebimento(item.idPedido)}
              activeOpacity={0.85}
            >
              <Ionicons name="bag-check-outline" size={18} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>Já retirei os produtos</Text>
            </TouchableOpacity>
          )
        )}

        {item.status === 'CANCELADO' && item.motivoCancelamento && (
          <View style={styles.motivoContainer}>
            <Text style={styles.motivoTitle}>Motivo do cancelamento</Text>
            <Text style={styles.motivoText}>{item.motivoCancelamento}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê (sem botão voltar: esta tela é uma aba) */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <Text style={styles.titulo}>Meus pedidos</Text>
        {!loading && pedidos.length > 0 && (
          <Text style={styles.subtitulo}>
            {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
          </Text>
        )}
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        {loading ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.centro}>
            <View style={styles.vazioCirculo}>
              <Ionicons name="receipt-outline" size={44} color={cores.primaria} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não realizou compras pelo aplicativo.
            </Text>
            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={() => navigation.navigate('HomeCliente')}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoPrimarioTexto}>Ver mercados</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={pedidos}
            keyExtractor={(item) => String(item.idPedido)}
            renderItem={renderPedido}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
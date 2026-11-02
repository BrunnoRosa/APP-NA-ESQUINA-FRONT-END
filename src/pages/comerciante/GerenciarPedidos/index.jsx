import { Ionicons } from '@expo/vector-icons'; // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🆕
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal, //novidade
  Platform,
  Text,
  TextInput, // novidade
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕
import { styles } from './styles';

// 🆕 Formata número como moeda brasileira
function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function GerenciarPedidos({ navigation }) {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState(null);
  const [pedidoCancelando, setPedidoCancelando] = useState(null); // id do pedido no modal
  const [motivo, setMotivo] = useState('');

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  const carregarPedidos = useCallback(async (isSilent = false) => {
    // ✏️ Sem fallback para a loja 1: usa só o mercadinho real do comerciante
    const idMercadinho = user?.idMercadinho;
    if (!idMercadinho) {
      setLoading(false);
      return;
    }

    try {
      if (!isSilent) setLoading(true);
      const response = await api.get(`/api/pedidos/mercadinho/${idMercadinho}`);
      setPedidos(response.data);
    } catch (error) {
      // ✏️ mostra o motivo real no console (antes o erro ficava escondido)
      console.error(
        'Erro ao carregar pedidos do mercadinho:',
        error?.response?.status,
        error?.response?.data || error.message
      );
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

  // Abre o modal de cancelamento (funciona em web, Android e iOS)
  const solicitarCancelamento = (idPedido) => {
    setMotivo('');
    setPedidoCancelando(idPedido);
  };

  const confirmarCancelamento = () => {
    const id = pedidoCancelando;
    setPedidoCancelando(null);
    alterarStatus(id, 'CANCELADO', motivo);
  };

  function getStatusInfo(status) {
    switch (status) {
      case 'PENDENTE':
        return { label: 'Aguardando separação', bg: '#FFF3CD', text: '#856404' };
      case 'EM_SEPARACAO':
        return { label: 'Separando produtos', bg: '#DCEBFF', text: '#1F4E8C' };
      case 'AGUARDANDO_RETIRADA':
        return { label: 'Pronto para retirada', bg: '#FFE9D2', text: '#B25E00' };
      case 'RETIRADA_CONCLUIDO':
        return { label: 'Concluído', bg: '#DDF5D9', text: '#168A00' };
      case 'CANCELADO':
        return { label: 'Cancelado', bg: '#FFE0E0', text: '#C41F1F' };
      default:
        return { label: status, bg: '#E2E3E5', text: '#383D41' };
    }
  }

  // 🆕 Quantos pedidos novos esperam resposta
  const pendentes = pedidos.filter((p) => p.status === 'PENDENTE').length;

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
        <View style={styles.clienteLinha}>
          <Ionicons name="person-outline" size={15} color={cores.textoSecundario} />
          <Text style={styles.clienteNome} numberOfLines={1}>
            {item.cliente?.nome || item.cliente?.email || 'Cliente'}
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

        {item.status === 'CANCELADO' && item.motivoCancelamento && (
          <View style={styles.motivoContainer}>
            <Text style={styles.motivoTitle}>Motivo do cancelamento</Text>
            <Text style={styles.motivoText}>{item.motivoCancelamento}</Text>
          </View>
        )}

        {isBusy ? (
          <ActivityIndicator style={{ marginTop: 12 }} size="small" color={cores.primaria} />
        ) : (
          <View style={styles.acoes}>
            {item.status === 'PENDENTE' && (
              <>
                <TouchableOpacity
                  style={[styles.btnAcao, styles.btnPrimario]}
                  onPress={() => alterarStatus(item.idPedido, 'EM_SEPARACAO')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cube-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.btnTexto}>Iniciar separação</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAcao, styles.btnContorno]}
                  onPress={() => solicitarCancelamento(item.idPedido)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={17} color={cores.primaria} />
                  <Text style={[styles.btnTexto, { color: cores.primaria }]}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === 'EM_SEPARACAO' && (
              <TouchableOpacity
                style={[styles.btnAcao, styles.btnPrimario]}
                onPress={() => alterarStatus(item.idPedido, 'AGUARDANDO_RETIRADA')}
                activeOpacity={0.85}
              >
                <Ionicons name="storefront-outline" size={17} color="#FFFFFF" />
                <Text style={styles.btnTexto}>Disponível para retirada</Text>
              </TouchableOpacity>
            )}

            {item.status === 'AGUARDANDO_RETIRADA' && (
              <TouchableOpacity
                style={[styles.btnAcao, styles.btnSucesso]}
                onPress={() => alterarStatus(item.idPedido, 'RETIRADA_CONCLUIDO')}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" />
                <Text style={styles.btnTexto}>Entregue ao cliente</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê (aba: sem botão voltar) */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <Text style={styles.titulo}>Pedidos recebidos</Text>
        {!loading && pedidos.length > 0 && (
          <Text style={styles.subtitulo}>
            {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            {pendentes > 0 ? ` • ${pendentes} ${pendentes === 1 ? 'novo' : 'novos'}` : ''}
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
            <Text style={styles.emptyTitle}>Nenhum pedido recebido</Text>
            <Text style={styles.emptySubtitle}>Os pedidos dos clientes aparecerão aqui.</Text>
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

            {/* 🆕 Modal de cancelamento */}
      <Modal
        visible={pedidoCancelando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPedidoCancelando(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Cancelar pedido #{pedidoCancelando}</Text>
            <Text style={styles.modalTexto}>
              Informe o motivo. O cliente poderá ver essa mensagem.
            </Text>
            <TextInput
              style={styles.modalCampo}
              value={motivo}
              onChangeText={setMotivo}
              placeholder="Ex.: produto indisponível no estoque"
              placeholderTextColor="#A0A4A8"
              multiline
              maxLength={200}
            />
            <View style={styles.modalAcoes}>
              <TouchableOpacity
                style={[styles.btnAcao, styles.btnContorno]}
                onPress={() => setPedidoCancelando(null)}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnTexto, { color: cores.primaria }]}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAcao, styles.btnPrimario]}
                onPress={confirmarCancelamento}
                activeOpacity={0.85}
              >
                <Text style={styles.btnTexto}>Cancelar pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
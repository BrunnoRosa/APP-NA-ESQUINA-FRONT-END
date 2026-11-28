import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { usePuxarParaAtualizar } from "../../../hooks/usePuxarParaAtualizar";
import { useDestacarPedido } from "../../../hooks/useDestacarPedido";
import api from "../../../services/api";
import { cores } from "../../../theme";
import { traduzirErro } from "../../../utils/validacoes";
import { styles } from "./styles";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function GerenciarPedidos({ route }) {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState(null);

  // Modal de cancelamento
  const [pedidoCancelando, setPedidoCancelando] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  // Modal de edição de itens (item em falta)
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [itensEditados, setItensEditados] = useState([]);
  const [motivoAjuste, setMotivoAjuste] = useState("");

  const { exibirAlerta } = useToast();

  const obterIdMercadinho = useCallback(async () => {
    const idDireto =
      user?.idMercadinho ||
      user?.mercadinho?.idMercadinho ||
      user?.mercadinho?.id;
    if (idDireto) return idDireto;

    const idComerciante = user?.idUsuario || user?.id;
    if (!idComerciante) return null;

    try {
      const res = await api.get(
        `/api/mercadinhos/comerciante/${idComerciante}`,
      );
      return res.data?.idMercadinho || res.data?.id || null;
    } catch {
      return null;
    }
  }, [user]);

  const carregarPedidos = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const idMercadinho = await obterIdMercadinho();
        if (!idMercadinho) return;

        const res = await api.get(`/api/pedidos/mercadinho/${idMercadinho}`);
        setPedidos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erro ao carregar pedidos do mercadinho:", error);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [obterIdMercadinho],
  );

  const pull = usePuxarParaAtualizar(() => carregarPedidos(true));

  // Aberta pelo pop-up "Novo pedido": rola até o pedido e o destaca
  const listaRef = useRef(null);
  const { idDestacado, aoFalharRolagem } = useDestacarPedido({
    route,
    pedidos,
    loading,
    listaRef,
  });

  useFocusEffect(
    useCallback(() => {
      carregarPedidos();
      const intervalId = setInterval(() => carregarPedidos(true), 5000);
      return () => clearInterval(intervalId);
    }, [carregarPedidos]),
  );

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      carregarPedidos(true);
    });
    return () => sub.remove();
  }, [carregarPedidos]);

  const alterarStatus = async (idPedido, novoStatus, motivo = null) => {
    setAtualizandoId(idPedido);
    try {
      await api.put(`/api/pedidos/${idPedido}/status`, null, {
        params: {
          status: novoStatus,
          ...(motivo ? { motivo } : {}),
        },
      });
      carregarPedidos(true);
    } catch (error) {
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setAtualizandoId(null);
    }
  };

  // --- Fluxo de Cancelamento ---
  const abrirModalCancelar = (pedido) => {
    setPedidoCancelando(pedido);
    setMotivoCancelamento("");
  };

  const confirmarCancelamento = async () => {
    if (!pedidoCancelando) return;
    const motivo = motivoCancelamento.trim();
    if (!motivo) {
      exibirAlerta(
        "Atenção",
        "Informe o motivo do cancelamento para o cliente.",
        "aviso",
      );
      return;
    }
    const idPedido = pedidoCancelando.idPedido;
    setPedidoCancelando(null);
    await alterarStatus(idPedido, "CANCELADO", motivo);
  };

  // --- Fluxo de Edição de Itens ---
  const abrirModalEditarItens = (pedido) => {
    setPedidoEditando(pedido);
    setItensEditados(
      (pedido.itens || []).map((it) => ({
        idItemPedido: it.idItemPedido,
        nome: it.produto?.nome || "Produto",
        precoUnitario: Number(it.precoUnitario || 0),
        quantidade: Number(it.quantidade || 1),
      })),
    );
    setMotivoAjuste("");
  };

  const alterarQuantidadeItemEdicao = (idItemPedido, delta) => {
    setItensEditados((prev) =>
      prev
        .map((it) =>
          it.idItemPedido === idItemPedido
            ? { ...it, quantidade: it.quantidade + delta }
            : it,
        )
        .filter((it) => it.quantidade > 0),
    );
  };

  const removerItemEdicao = (idItemPedido) => {
    setItensEditados((prev) =>
      prev.filter((it) => it.idItemPedido !== idItemPedido),
    );
  };

  const novoTotalEdicao = itensEditados.reduce(
    (acc, it) => acc + it.precoUnitario * it.quantidade,
    0,
  );

  const salvarEdicaoPedido = async () => {
    if (!pedidoEditando) return;

    if (itensEditados.length === 0) {
      exibirAlerta(
        "Nenhum item restante",
        "Se todos os itens estão em falta, feche esta janela e use a opção Cancelar pedido.",
        "aviso",
      );
      return;
    }

    const idPedido = pedidoEditando.idPedido;
    const payload = {
      motivoAjuste:
        motivoAjuste.trim() ||
        "Item(ns) indisponível(is) no estoque no momento.",
      itens: itensEditados.map((it) => ({
        idItemPedido: it.idItemPedido,
        quantidade: it.quantidade,
      })),
    };

    setPedidoEditando(null);
    setAtualizandoId(idPedido);

    try {
      await api.put(`/api/pedidos/${idPedido}/editar-itens`, payload);
      exibirAlerta(
        "Alteração enviada!",
        `O pedido #${idPedido} foi enviado para o cliente aprovar o novo valor.`,
        "sucesso",
      );
      carregarPedidos(true);
    } catch (error) {
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setAtualizandoId(null);
    }
  };

  function getStatusInfo(status) {
    switch (status) {
      case "PENDENTE":
        return {
          label: "Aguardando separação",
          bg: "#FFF3CD",
          text: "#856404",
        };
      case "AGUARDANDO_APROVACAO_CLIENTE":
        return {
          label: "Aguardando cliente aprovar",
          bg: "#FDEBD0",
          text: "#B9770E",
        };
      case "EM_SEPARACAO":
        return { label: "Em separação", bg: "#DCEBFF", text: "#1F4E8C" };
      case "AGUARDANDO_RETIRADA":
        return {
          label: "Pronto para retirada",
          bg: "#FFE9D2",
          text: "#B25E00",
        };
      case "RETIRADA_CONCLUIDO":
        return { label: "Retirado", bg: "#DDF5D9", text: "#168A00" };
      case "CANCELADO":
        return { label: "Cancelado", bg: "#FFE0E0", text: "#C41F1F" };
      default:
        return { label: status, bg: "#E2E3E5", text: "#383D41" };
    }
  }

  const novosCount = pedidos.filter((p) => p.status === "PENDENTE").length;

  function renderPedido({ item }) {
    const statusInfo = getStatusInfo(item.status);
    const isBusy = atualizandoId === item.idPedido;
    const podeEditar =
      item.status === "PENDENTE" || item.status === "EM_SEPARACAO";
    const podeCancelar =
      item.status === "PENDENTE" ||
      item.status === "EM_SEPARACAO" ||
      item.status === "AGUARDANDO_APROVACAO_CLIENTE" ||
      item.status === "AGUARDANDO_RETIRADA";

    return (
      <View
        style={[
          styles.pedidoCard,
          idDestacado === item.idPedido && styles.pedidoDestacado,
        ]}
      >
        <View style={styles.pedidoHeader}>
          <Text style={styles.pedidoNumero}>Pedido #{item.idPedido}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
          >
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.clienteLinha}>
          <Ionicons
            name="person-outline"
            size={15}
            color={cores.textoSecundario}
          />
          <Text style={styles.clienteNome}>
            {item.cliente?.nome || "Cliente"}
          </Text>
        </View>

        <View style={styles.divider} />

        {item.itens?.map((it) => (
          <View key={String(it.idItemPedido)} style={styles.itemRow}>
            <Text style={styles.itemNome}>
              {it.quantidade}x {it.produto?.nome}
            </Text>
            <Text style={styles.itemPreco}>
              {formatarMoeda(it.precoUnitario * it.quantidade)}
            </Text>
          </View>
        ))}

        <View style={styles.pedidoFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>
            {formatarMoeda(item.valorTotal)}
          </Text>
        </View>

        {item.status === "AGUARDANDO_APROVACAO_CLIENTE" && (
          <View style={styles.avisoAguardandoBox}>
            <Ionicons name="time-outline" size={16} color="#B9770E" />
            <Text style={styles.avisoAguardandoTexto}>
              Aguardando o cliente aprovar ou recusar a remoção de itens.
            </Text>
          </View>
        )}

        {isBusy ? (
          <ActivityIndicator
            style={{ marginTop: 14 }}
            size="small"
            color={cores.primaria}
          />
        ) : (
          <>
            {item.status === "PENDENTE" && (
              <TouchableOpacity
                style={styles.btnPrimario}
                onPress={() => alterarStatus(item.idPedido, "EM_SEPARACAO")}
                activeOpacity={0.85}
              >
                <Ionicons name="cube-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnPrimarioTexto}>Iniciar separação</Text>
              </TouchableOpacity>
            )}

            {item.status === "EM_SEPARACAO" && (
              <TouchableOpacity
                style={styles.btnPrimario}
                onPress={() =>
                  alterarStatus(item.idPedido, "AGUARDANDO_RETIRADA")
                }
                activeOpacity={0.85}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.btnPrimarioTexto}>
                  Pronto para retirada
                </Text>
              </TouchableOpacity>
            )}

            {item.status === "AGUARDANDO_RETIRADA" && (
              <TouchableOpacity
                style={[styles.btnPrimario, styles.btnSucesso]}
                onPress={() =>
                  alterarStatus(item.idPedido, "RETIRADA_CONCLUIDO")
                }
                activeOpacity={0.85}
              >
                <Ionicons name="bag-check-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnPrimarioTexto}>Confirmar retirada</Text>
              </TouchableOpacity>
            )}

            {podeEditar && (
              <TouchableOpacity
                style={styles.btnEditar}
                onPress={() => abrirModalEditarItens(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="create-outline" size={18} color="#D97706" />
                <Text style={styles.btnEditarTexto}>
                  Editar itens (falta no estoque)
                </Text>
              </TouchableOpacity>
            )}

            {podeCancelar && (
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => abrirModalCancelar(item)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={cores.primaria}
                />
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {item.status === "CANCELADO" && item.motivoCancelamento && (
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
      {pull.indicador}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <Text style={styles.titulo}>Pedidos recebidos</Text>
        {!loading && (
          <Text style={styles.subtitulo}>
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            {novosCount > 0
              ? ` • ${novosCount} ${novosCount === 1 ? "novo" : "novos"}`
              : ""}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.folha}>
        {loading ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.centro}>
            <Text style={styles.vazioTexto}>Nenhum pedido recebido ainda.</Text>
          </View>
        ) : (
          <FlatList
            {...pull.props}
            ref={listaRef}
            onScrollToIndexFailed={aoFalharRolagem}
            data={pedidos}
            keyExtractor={(item) => String(item.idPedido)}
            renderItem={renderPedido}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal 1: Cancelar Pedido */}
      <Modal
        visible={pedidoCancelando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPedidoCancelando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              Cancelar pedido #{pedidoCancelando?.idPedido}
            </Text>
            <Text style={styles.modalSubtitulo}>
              Informe o motivo. O cliente poderá ver essa mensagem.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Ex.: produto indisponível no estoque"
              placeholderTextColor="#999999"
              value={motivoCancelamento}
              onChangeText={setMotivoCancelamento}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBtnVoltar}
                onPress={() => setPedidoCancelando(null)}
              >
                <Text style={styles.modalBtnVoltarTexto}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirmar}
                onPress={confirmarCancelamento}
              >
                <Text style={styles.modalBtnConfirmarTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Editar Itens do Pedido (Item em Falta) */}
      <Modal
        visible={pedidoEditando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPedidoEditando(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              Editar itens — Pedido #{pedidoEditando?.idPedido}
            </Text>
            <Text style={styles.modalSubtitulo}>
              Remova ou ajuste os itens em falta. O cliente receberá o pedido
              atualizado para aprovar ou recusar.
            </Text>

            {itensEditados.map((it) => (
              <View key={String(it.idItemPedido)} style={styles.editItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editItemNome} numberOfLines={2}>
                    {it.nome}
                  </Text>
                  <Text style={styles.editItemSub}>
                    {formatarMoeda(it.precoUnitario)} un. • Subtotal:{" "}
                    {formatarMoeda(it.precoUnitario * it.quantidade)}
                  </Text>
                </View>

                <View style={styles.editQtdBox}>
                  <TouchableOpacity
                    style={styles.editQtdBtn}
                    onPress={() =>
                      alterarQuantidadeItemEdicao(it.idItemPedido, -1)
                    }
                  >
                    <Ionicons name="remove" size={16} color="#212529" />
                  </TouchableOpacity>
                  <Text style={styles.editQtdValor}>{it.quantidade}</Text>
                  <TouchableOpacity
                    style={styles.editQtdBtn}
                    onPress={() =>
                      alterarQuantidadeItemEdicao(it.idItemPedido, 1)
                    }
                  >
                    <Ionicons name="add" size={16} color="#212529" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.editTrashBtn}
                  onPress={() => removerItemEdicao(it.idItemPedido)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={cores.primaria}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.editNovoTotalRow}>
              <Text style={styles.editNovoTotalLabel}>Novo total:</Text>
              <Text style={styles.editNovoTotalValor}>
                {formatarMoeda(novoTotalEdicao)}
              </Text>
            </View>

            <TextInput
              style={[styles.modalInput, { minHeight: 68 }]}
              placeholder="Mensagem para o cliente (ex.: Feijão carioca em falta hoje)"
              placeholderTextColor="#999999"
              value={motivoAjuste}
              onChangeText={setMotivoAjuste}
              multiline
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBtnVoltar}
                onPress={() => setPedidoEditando(null)}
              >
                <Text style={styles.modalBtnVoltarTexto}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnConfirmar}
                onPress={salvarEdicaoPedido}
              >
                <Text style={styles.modalBtnConfirmarTexto}>
                  Enviar ao cliente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
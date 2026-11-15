import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { usePuxarParaAtualizar } from "../../../hooks/usePuxarParaAtualizar";
import api from "../../../services/api";
import { cores } from "../../../theme";
import { traduzirErro } from "../../../utils/validacoes";
import { styles } from "./styles";

// Formata número como moeda brasileira
function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function MeusPedidos({ navigation }) {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState(null);

  // Toast central: exibirAlerta = avisos | confirmar = perguntas com botões (Sim / Não)
  const { exibirAlerta, confirmar } = useToast();

  const carregarPedidos = useCallback(
    async (isSilent = false) => {
      const idCliente = user?.idUsuario || user?.id;
      if (!idCliente) return;

      try {
        if (!isSilent) setLoading(true);
        const response = await api.get(`/api/pedidos/cliente/${idCliente}`);
        setPedidos(response.data);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [user],
  );

  const pull = usePuxarParaAtualizar(() => carregarPedidos(true));

  useFocusEffect(
    useCallback(() => {
      carregarPedidos();

      const intervalId = setInterval(() => {
        carregarPedidos(true);
      }, 5000);

      return () => clearInterval(intervalId);
    }, [carregarPedidos]),
  );

  // 🔔 Atualização instantânea ao receber notificação push do Expo
  useEffect(() => {
    const inscricaoNotificacao = Notifications.addNotificationReceivedListener(
      () => {
        carregarPedidos(true);
      },
    );

    return () => {
      inscricaoNotificacao.remove();
    };
  }, [carregarPedidos]);

  // Botão de voltar: volta para a tela de onde o cliente veio (Início ou Conta)
  function voltar() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("HomeCliente");
  }

  const confirmarRecebimento = async (idPedido) => {
    // Concluir é definitivo (não dá para reabrir o pedido), então pergunta antes
    const sim = await confirmar({
      titulo: "Confirmar retirada",
      mensagem: `Você já retirou os produtos do pedido #${idPedido}?`,
      textoConfirmar: "Sim, retirei",
      textoCancelar: "Ainda não",
      tipo: "sucesso",
    });
    if (!sim) return;

    setAtualizandoId(idPedido);
    try {
      await api.put(
        `/api/pedidos/${idPedido}/status?status=RETIRADA_CONCLUIDO`,
      );
      exibirAlerta(
        "Pedido Retirado! 🎉",
        `Obrigado por comprar conosco, volte sempre! #${idPedido}.`,
      );
      carregarPedidos(true);
    } catch (error) {
      console.error("Erro ao confirmar a retirada do pedido:", error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setAtualizandoId(null);
    }
  };

  // O cliente pode cancelar enquanto o pedido NÃO foi concluído nem cancelado
  function podeCancelar(status) {
    return (
      status === "PENDENTE" ||
      status === "EM_SEPARACAO" ||
      status === "AGUARDANDO_RETIRADA"
    );
  }

  const cancelarPedido = async (idPedido) => {
    const sim = await confirmar({
      titulo: "Cancelar pedido",
      mensagem: `Deseja realmente cancelar o pedido #${idPedido}? Essa ação não pode ser desfeita.`,
      textoConfirmar: "Sim, cancelar",
      textoCancelar: "Não, manter",
      tipo: "perigo",
    });
    if (!sim) return;

    setAtualizandoId(idPedido);
    try {
      await api.put(`/api/pedidos/${idPedido}/cancelar`);
      exibirAlerta(
        "Pedido cancelado",
        `O pedido #${idPedido} foi cancelado.`,
        "sucesso",
      );
      carregarPedidos(true);
    } catch (error) {
      console.error("Erro ao cancelar o pedido:", error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
      // Se a loja concluiu/cancelou no mesmo instante, atualiza a lista com o status real
      carregarPedidos(true);
    } finally {
      setAtualizandoId(null);
    }
  };

  function getStatusInfo(status) {
    switch (status) {
      case "PENDENTE":
        return {
          label: "Aguardando aprovação",
          bg: "#FFF3CD",
          text: "#856404",
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

  function renderPedido({ item }) {
    const statusInfo = getStatusInfo(item.status);
    const isBusy = atualizandoId === item.idPedido;

    return (
      <View style={styles.pedidoCard}>
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

        <View style={styles.lojaLinha}>
          <Ionicons
            name="storefront-outline"
            size={15}
            color={cores.textoSecundario}
          />
          <Text style={styles.mercadinhoNome} numberOfLines={1}>
            {item.mercadinho?.nomeFantasia || "Mercadinho"}
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
          <Text style={styles.totalValor}>
            {formatarMoeda(item.valorTotal)}
          </Text>
        </View>

        {podeCancelar(item.status) &&
          (isBusy ? (
            <ActivityIndicator
              style={{ marginTop: 12 }}
              size="small"
              color={cores.primaria}
            />
          ) : (
            <>
              {item.status === "AGUARDANDO_RETIRADA" && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => confirmarRecebimento(item.idPedido)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bag-check-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>
                    Já retirei os produtos
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelarPedido(item.idPedido)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={cores.primaria}
                />
                <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
              </TouchableOpacity>
            </>
          ))}

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
        <View style={styles.topoLinha}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={voltar}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
          </TouchableOpacity>

          <View>
            <Text style={styles.titulo}>Meus pedidos</Text>
            {!loading && pedidos.length > 0 && (
              <Text style={styles.subtitulo}>
                {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        {loading ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.centro}>
            <View style={styles.vazioCirculo}>
              <Ionicons
                name="receipt-outline"
                size={44}
                color={cores.primaria}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não realizou compras pelo aplicativo.
            </Text>
            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={() => navigation.navigate("HomeCliente")}
              activeOpacity={0.85}
            >
              <Text style={styles.botaoPrimarioTexto}>Ver mercados</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList {...pull.props}
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
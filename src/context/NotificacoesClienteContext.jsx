import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const NotificacoesClienteContext = createContext({
  notificacoes: [],
  temNaoLidas: false,
  marcarTodasComoLidas: () => {},
});

const INTERVALO_MS = 5000;

function formatarHoraAtual() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  return `Hoje às ${horas}:${minutos}`;
}

function montarMensagemStatus(pedido) {
  const id = pedido.idPedido;
  const loja = pedido.mercadinho?.nomeFantasia || "o mercadinho";

  // "tipo" define a cor da faixa do toast: sucesso (verde) | erro (vermelho) | aviso (laranja) | info (azul-escuro)
  switch (pedido.status) {
    case "EM_SEPARACAO":
      return {
        tipo: "sucesso",
        titulo: `Pedido #${id} em separação`,
        mensagem: `${loja} começou a separar os itens do seu pedido!`,
      };
    case "AGUARDANDO_RETIRADA":
      return {
        tipo: "sucesso",
        titulo: `Pedido #${id} pronto para retirada!`,
        mensagem: `Seus produtos já estão prontos em ${loja}. Pode ir retirar!`,
      };
    case "RETIRADA_CONCLUIDO":
      return {
        tipo: "sucesso",
        titulo: `Pedido #${id} concluído`,
        mensagem: `Pedido retirado em ${loja}. Obrigado pela preferência!`,
      };
    case "CANCELADO":
      return {
        tipo: "erro",
        titulo: `Pedido #${id} cancelado`,
        mensagem: pedido.motivoCancelamento
          ? `Motivo: ${pedido.motivoCancelamento}`
          : `Seu pedido em ${loja} foi cancelado.`,
      };
    default:
      return {
        tipo: "info",
        titulo: `Atualização no pedido #${id}`,
        mensagem: `O status do seu pedido mudou para ${pedido.status}.`,
      };
  }
}

export function NotificacoesClienteProvider({ children }) {
  const { user } = useAuth();
  const { exibirAlerta } = useToast();

  const [notificacoes, setNotificacoes] = useState([
    {
      id: "1",
      titulo: "Bem-vindo ao Na Esquina!",
      mensagem: "Aproveite as ofertas e promoções dos mercados próximos de si.",
      data: "Hoje",
      lida: false,
    },
  ]);

  const statusAnterioresRef = useRef(null);
  const avisoRef = useRef(exibirAlerta);
  avisoRef.current = exibirAlerta;

  const idCliente =
    user?.perfil === "CLIENTE" ? user?.idUsuario || user?.id : null;

  const verificarAlteracoesPedidos = useCallback(async () => {
    if (!idCliente) return;

    try {
      const response = await api.get(`/api/pedidos/cliente/${idCliente}`);
      const pedidos = Array.isArray(response.data) ? response.data : [];
      const mapaAtual = {};

      pedidos.forEach((pedido) => {
        const id = pedido.idPedido;
        const novoStatus = pedido.status;
        mapaAtual[id] = novoStatus;

        if (statusAnterioresRef.current !== null) {
          const statusAnterior = statusAnterioresRef.current[id];

          if (statusAnterior && statusAnterior !== novoStatus) {
            const { tipo, titulo, mensagem } = montarMensagemStatus(pedido); //se quiser em preparação em laranja trocar "tipo" para "aviso"

            avisoRef.current(titulo, mensagem, tipo);

            setNotificacoes((prev) => [
              {
                id: `${id}-${novoStatus}-${Date.now()}`,
                titulo,
                mensagem,
                data: formatarHoraAtual(),
                lida: false,
              },
              ...prev,
            ]);
          }
        }
      });

      statusAnterioresRef.current = mapaAtual;
    } catch (error) {
      // Falha de rede: mantém o último estado memorizado
    }
  }, [idCliente]);

  useEffect(() => {
    if (!idCliente) {
      statusAnterioresRef.current = null;
      return;
    }

    verificarAlteracoesPedidos();
    const intervalId = setInterval(verificarAlteracoesPedidos, INTERVALO_MS);

    return () => clearInterval(intervalId);
  }, [idCliente, verificarAlteracoesPedidos]);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((item) => ({ ...item, lida: true })));
  }, []);

  const temNaoLidas = notificacoes.some((item) => !item.lida);

  return (
    <NotificacoesClienteContext.Provider
      value={{
        notificacoes,
        temNaoLidas,
        marcarTodasComoLidas,
      }}
    >
      {children}
    </NotificacoesClienteContext.Provider>
  );
}

export function useNotificacoesCliente() {
  return useContext(NotificacoesClienteContext);
}

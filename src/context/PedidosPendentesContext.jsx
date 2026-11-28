import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { irParaPedido } from '../services/navegacao';
import { useToast } from './ToastContext';

// Guarda quantos pedidos estão PENDENTES (esperando o comerciante) e avisa quando chega um novo.
// Só funciona para o perfil COMERCIANTE; para o cliente o valor fica sempre 0.
const PedidosPendentesContext = createContext({ pendentes: 0, atualizar: () => {} });

const INTERVALO_MS = 10000; // confere o back-end a cada 10 segundos

export function PedidosPendentesProvider({ children }) {
  const { user } = useAuth();
  const { exibirAlerta } = useToast();
  const [pendentes, setPendentes] = useState(0);

  // null = ainda não carregou a primeira vez (evita avisar "novo pedido" ao abrir o app)
  // Guarda os NÚMEROS dos pedidos pendentes, para saber exatamente qual chegou agora.
  const anterior = useRef(null);

  // Guarda a função de aviso numa "caixinha" para ela não reiniciar o temporizador
  const avisoRef = useRef(exibirAlerta);
  avisoRef.current = exibirAlerta;

  const idMercadinho = user?.perfil === 'COMERCIANTE' ? user?.idMercadinho : null;

  const atualizar = useCallback(async () => {
    if (!idMercadinho) return;
    try {
      const res = await api.get(`/api/pedidos/mercadinho/${idMercadinho}`);
      const lista = Array.isArray(res.data) ? res.data : [];
      const idsPendentes = lista
        .filter((p) => p.status === 'PENDENTE')
        .map((p) => p.idPedido);
      const total = idsPendentes.length;

      if (anterior.current !== null) {
        // Pedidos que NÃO estavam pendentes na última conferência = acabaram de chegar
        const novos = idsPendentes.filter((id) => !anterior.current.has(id));
        if (novos.length > 0) {
          const idDestino = Math.max(...novos); // o mais recente
          avisoRef.current(
            novos.length === 1
              ? `Novo pedido #${idDestino} recebido`
              : 'Novos pedidos recebidos',
            total === 1
              ? 'Há 1 pedido aguardando separação.'
              : `Há ${total} pedidos aguardando separação.`,
            'sucesso', // verde, igual aos avisos de pedido do cliente
            {
              // Tocar no pop-up abre o pedido (o mais recente, se chegaram vários)
              aoClicar: () => irParaPedido('COMERCIANTE', idDestino),
              textoAcao: 'Toque para ver o pedido',
            },
          );
        }
      }
      anterior.current = new Set(idsPendentes);
      setPendentes(total);
    } catch (error) {
      // Falha de rede: mantém o último número mostrado
    }
  }, [idMercadinho]);

  useEffect(() => {
    anterior.current = null;
    setPendentes(0);
    if (!idMercadinho) return undefined;

    atualizar();
    const id = setInterval(atualizar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [idMercadinho, atualizar]);

  return (
    <PedidosPendentesContext.Provider value={{ pendentes, atualizar }}>
      {children}
    </PedidosPendentesContext.Provider>
  );
}

export function usePedidosPendentes() {
  return useContext(PedidosPendentesContext);
}

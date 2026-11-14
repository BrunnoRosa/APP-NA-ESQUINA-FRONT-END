import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
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
      const total = lista.filter((p) => p.status === 'PENDENTE').length;

      if (anterior.current !== null && total > anterior.current) {
                avisoRef.current(
          'Novo pedido recebido',
          total === 1
            ? 'Há 1 pedido aguardando separação.'
            : `Há ${total} pedidos aguardando separação.`,
          'sucesso' // verde, igual aos avisos de pedido do cliente // se precisar trocar pra laranja só trocar sucesso pra 'aviso' aqui
        );
      }
      anterior.current = total;
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

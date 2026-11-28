import { useCallback, useEffect, useRef, useState } from "react";

// Quando a tela de pedidos é aberta por um pop-up/notificação, ela recebe
// route.params = { idPedido, _ts }. Este hook rola a lista até esse pedido e o deixa
// destacado por alguns segundos.
//
// Uso:
//   const listaRef = useRef(null);
//   const { idDestacado, aoFalharRolagem } = useDestacarPedido({ route, pedidos, loading, listaRef });
//   <FlatList ref={listaRef} onScrollToIndexFailed={aoFalharRolagem} ... />
//   e no cartão: idDestacado === item.idPedido && styles.pedidoDestacado
const TEMPO_DESTAQUE_MS = 7000;

export function useDestacarPedido({ route, pedidos, loading, listaRef }) {
  const [idDestacado, setIdDestacado] = useState(null);
  const tratadoRef = useRef(null); // _ts já tratado (não rola de novo a cada atualização da lista)
  const timerRolagem = useRef(null);
  const timerDestaque = useRef(null);

  const idAlvo = route?.params?.idPedido;
  const ts = route?.params?._ts;

  useEffect(() => {
    if (!idAlvo || loading || tratadoRef.current === ts) return;

    const indice = pedidos.findIndex((p) => Number(p.idPedido) === Number(idAlvo));
    // Ainda não está na lista (acabou de ser criado): tenta de novo na próxima atualização
    if (indice < 0) return;

    tratadoRef.current = ts;
    setIdDestacado(Number(idAlvo));

    clearTimeout(timerRolagem.current);
    clearTimeout(timerDestaque.current);
    // Pequena espera para a lista já estar na tela antes de rolar
    timerRolagem.current = setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({ index: indice, animated: true, viewPosition: 0 });
      } catch (e) {
        // sem problema: onScrollToIndexFailed tenta de outro jeito
      }
    }, 200);
    timerDestaque.current = setTimeout(() => setIdDestacado(null), TEMPO_DESTAQUE_MS);
  }, [idAlvo, ts, pedidos, loading, listaRef]);

  useEffect(
    () => () => {
      clearTimeout(timerRolagem.current);
      clearTimeout(timerDestaque.current);
    },
    [],
  );

  // A altura dos cartões varia: se o item ainda não foi medido, vai por estimativa
  const aoFalharRolagem = useCallback(
    ({ index, averageItemLength }) => {
      listaRef.current?.scrollToOffset({
        offset: Math.max(0, index * (averageItemLength || 200)),
        animated: true,
      });
    },
    [listaRef],
  );

  return { idDestacado, aoFalharRolagem };
}

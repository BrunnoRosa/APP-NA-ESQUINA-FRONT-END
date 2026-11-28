import { createNavigationContainerRef } from "@react-navigation/native";

// Referência global da navegação. Serve para abrir telas de FORA de uma tela
// (ex.: ao clicar no pop-up de "Novo pedido", que é criado num contexto).
// O App.jsx liga esta referência ao <NavigationContainer ref={navigationRef}>.
export const navigationRef = createNavigationContainerRef();

// Abre a lista de pedidos já destacando o pedido escolhido.
//  - CLIENTE      -> aba "MeusPedidos"
//  - COMERCIANTE  -> aba "GerenciarPedidos"
// A tela recebe { idPedido, _ts }: o _ts muda a cada clique para a tela reagir mesmo se
// o mesmo pedido for aberto duas vezes seguidas.
export function irParaPedido(perfil, idPedido) {
  if (!navigationRef.isReady()) return;

  const params = { idPedido: idPedido ?? null, _ts: Date.now() };

  if (perfil === "COMERCIANTE") {
    navigationRef.navigate("ComercianteTabs", {
      screen: "GerenciarPedidos",
      params,
    });
  } else if (perfil === "CLIENTE") {
    navigationRef.navigate("ClienteTabs", {
      screen: "MeusPedidos",
      params,
    });
  }
}

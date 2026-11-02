import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase,
  },

  // Topo com degradê
  topo: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nomeLoja: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  enderecoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  enderecoLoja: {
    flex: 1,
    fontSize: 13,
    color: cores.textoEndereco,
  },

  // Folha branca
  folha: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110, // espaço para o botão do carrinho não cobrir o último item
  },

  // Selo e funcionamento
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  seloStatus: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  seloTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  funcionamento: {
    fontSize: 13,
    color: cores.textoSecundario,
  },

  // Seções
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 12,
  },
  carrossel: {
    marginBottom: 22,
    marginHorizontal: -20,        // deixa o carrossel encostar nas bordas da tela
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 20,
  },
});
import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  // Área do degradê topo
  cabecalho: {
    paddingBottom: 40,
  },

  // Folha de cantos arredondados que sobe sobre o degradê
  folha: {
    flex: 1,
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },

  // Topo com busca e logo
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    gap: 12,
  },
  campoBusca: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    height: 44,
  },
  inputBusca: {
    flex: 1,
    fontSize: 14,
    color: cores.textoCampo,
  },
  limpar: {
    padding: 4,
    marginRight: 4,
  },
  botaoFiltro: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 62,
  },

  // Títulos das seções
  tituloSecao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoSecundario,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  subtituloSecao: {
    fontSize: 12,
    color: cores.textoRaio,
    marginTop: -10,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  carrossel: {
    paddingHorizontal: 16,
  },
  divisor: {
    height: 1,
    backgroundColor: cores.divisor,
    marginHorizontal: 16,
    marginVertical: 20,
  },

  // Filtros
  filtros: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  categoriesScroll: {
    marginBottom: 12,
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: cores.fundoCirculo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: cores.primaria,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  sortBtn: {
    backgroundColor: cores.fundoVerMais,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.primaria,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: cores.textoSecundario,
    paddingVertical: 24,
  },
});
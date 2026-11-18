import { Platform, StatusBar, StyleSheet } from 'react-native';
import { cores } from '../../../theme';

const PRIMARIA = cores.primaria || '#E52421';
const TOPO = cores.degradeTopo || '#FFDF6D';
const FUNDO = cores.fundo || '#FFFFFF';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOPO,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCentro: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitulo: {
    fontSize: 12,
    color: '#495057',
  },
  headerAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Barra de múltiplas listas */
  listasBarContainer: {
    marginBottom: 10,
  },
  listasBarScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  listaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  listaChipAtiva: {
    backgroundColor: '#212529',
  },
  listaChipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
  },
  listaChipTextoAtiva: {
    color: '#FFFFFF',
  },
  listaChipBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  listaChipBadgeAtiva: {
    backgroundColor: PRIMARIA,
  },
  listaChipBadgeTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#212529',
  },
  listaChipBadgeTextoAtiva: {
    color: '#FFFFFF',
  },
  novaListaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#212529',
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  novaListaChipTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
  },

  /* Folha Branca */
  folha: {
    flex: 1,
    backgroundColor: FUNDO,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* Abas internas */
  abasContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  abaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  abaBtnAtiva: {
    backgroundColor: PRIMARIA,
  },
  abaTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555555',
  },
  abaTextoAtiva: {
    color: '#FFFFFF',
  },

  /* Input de Adição */
  inputCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 14,
  },
  inputLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputTexto: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    paddingVertical: 4,
  },
  btnConfigItem: {
    padding: 6,
  },
  btnAdicionar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: PRIMARIA,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Opções avançadas de item */
  opcoesAvancadas: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  opcaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opcaoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  qtdControle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  qtdBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtdBtnTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  qtdValor: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginRight: 6,
  },
  miniChipAtivo: {
    backgroundColor: PRIMARIA,
    borderColor: PRIMARIA,
  },
  miniChipTexto: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
  miniChipTextoAtivo: {
    color: '#FFFFFF',
  },

  /* Autocomplete do catálogo */
  sugestoesBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  sugestoesTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C757D',
    marginBottom: 6,
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  sugestaoImg: {
    width: 34,
    height: 34,
    borderRadius: 6,
  },
  sugestaoImgPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sugestaoNome: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
  },
  sugestaoPreco: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },

  /* Card de Progresso */
  resumoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  resumoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  resumoSubtitulo: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 2,
  },
  resumoAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  acaoIconBtn: {
    padding: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  barraProgressoFundo: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  barraProgressoPreenchida: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  filtrosLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtrosGrupo: {
    flexDirection: 'row',
    gap: 6,
  },
  filtroPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
  },
  filtroPillAtivo: {
    backgroundColor: '#212529',
  },
  filtroPillTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  filtroPillTextoAtivo: {
    color: '#FFFFFF',
  },
  limparMarcadosTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARIA,
  },

  /* Seções de Categorias e Itens */
  categoriaSecao: {
    marginBottom: 16,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categoriaTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  categoriaContagem: {
    fontSize: 12,
    color: '#888888',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemCardMarcado: {
    backgroundColor: '#F8F9FA',
    opacity: 0.72,
  },
  checkboxArea: {
    paddingRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  itemNomeMarcado: {
    textDecorationLine: 'line-through',
    color: '#868E96',
  },
  itemMetaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  itemQtdTexto: {
    fontSize: 12,
    color: '#6C757D',
  },
  itemPrecoRef: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  itemControles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniQtdBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniQtdValor: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  btnRemoverItem: {
    padding: 6,
    marginLeft: 2,
  },
  desmarcarTodosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARIA,
    marginTop: 6,
  },
  desmarcarTodosTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PRIMARIA,
  },

  /* Estado Vazio & Templates */
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginTop: 10,
  },
  emptySubtitulo: {
    fontSize: 13,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  templateCard: {
    width: '46%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'flex-start',
  },
  templateNome: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 8,
  },
  templateQtd: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 2,
  },

  /* Aba Comparar Preços */
  compararBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 14,
  },
  compararBannerTexto: {
    flex: 1,
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 17,
  },
  mercadoCompCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  selosLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  seloBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  seloTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  mercadoCompHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mercadoCompNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  mercadoCompMeta: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  mercadoCompTotalLabel: {
    fontSize: 11,
    color: '#6C757D',
  },
  mercadoCompTotalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  verDetalhesCompBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  verDetalhesCompTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  detalhesCompBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  compItemLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compItemNome: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    marginRight: 8,
  },
  compItemPreco: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
  },
  compItemFaltante: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  enviarCarrinhoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARIA,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 6,
    gap: 8,
  },
  enviarCarrinhoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* Modal Nova Lista */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#212529',
    marginBottom: 10,
  },
  modalCriarBtn: {
    backgroundColor: PRIMARIA,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCriarBtnTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalSubtitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 18,
    marginBottom: 10,
  },
  modalTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  modalTemplateNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  modalTemplateDesc: {
    fontSize: 12,
    color: '#868E96',
  },
});
import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase,
  },

  // Topo
  topo: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 2,
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
  lista: {
    padding: 20,
    paddingBottom: 30,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 30,
  },

  // Bloco de explicação
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  bannerIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 3,
  },
  bannerTexto: {
    fontSize: 12,
    color: cores.textoSecundario,
    lineHeight: 17,
  },

  // Cartão do produto
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  foto: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  nomeProduto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  precoProduto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.primaria,
    marginTop: 2,
  },

  // Preço em promoção (De / Por / -%)
  precoAntigo: {
    fontSize: 12,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  linhaPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  precoNovo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#168A00',
  },
  badgeDesconto: {
    backgroundColor: '#DDF5D9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeDescontoTexto: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#168A00',
  },

  // Coluna de botões (Destaque + Promoção)
  colunaBotoes: {
    gap: 6,
    alignItems: 'flex-end',
  },
  btnDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 98,
  },
  btnDestaqueAtivo: {
    backgroundColor: cores.primaria,
  },
  btnDestaqueInativo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  btnTextoAtivo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnTextoInativo: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Botão de promoção
  btnPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 98,
  },
  btnPromoAtivo: {
    backgroundColor: '#168A00',
  },
  btnPromoInativo: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#168A00',
  },
  btnPromoTextoAtivo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  btnPromoTextoInativo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#168A00',
  },

  // Modal de configurar promoção
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  modalProdutoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginTop: 4,
  },
  modalPrecoAtual: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoTitulo,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: cores.textoTitulo,
  },
  previewBox: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
  },
  previewTexto: {
    fontSize: 13,
    color: '#168A00',
  },
  modalBtnSalvar: {
    marginTop: 16,
    backgroundColor: '#168A00',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnSalvarTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalBtnEncerrar: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnEncerrarTexto: {
    color: cores.primaria,
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalBtnCancelar: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalBtnCancelarTexto: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
});
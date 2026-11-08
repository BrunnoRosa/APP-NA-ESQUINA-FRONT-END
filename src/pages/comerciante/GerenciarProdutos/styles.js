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
  topoDesktop: {
    paddingTop: 34,
    paddingHorizontal: 40,
    paddingBottom: 52,
  },
  tituloDesktop: {
    fontSize: 30,
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
    paddingBottom: 40,
  },
  folhaDesktop: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  listaDesktop: {
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
    padding: 32,
    paddingBottom: 56,
  },

  // Botão do catálogo global
  btnCatalogo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.primaria,
    borderRadius: 28,
    paddingVertical: 14,
  },
  btnCatalogoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnCatalogoDesktop: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingVertical: 15,
  },

  // Divisor "ou"
  divisorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  divisorTraco: {
    flex: 1,
    height: 1,
    backgroundColor: cores.divisor,
  },
  divisorTexto: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  divisorLinhaDesktop: {
    maxWidth: 720,
  },

  // Formulário avulso
  formCard: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },
  formCardDesktop: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'flex-start',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
  },
  formTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: cores.textoCampo,
    marginBottom: 12,
  },
  btnPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 12,
  },
  secaoTituloDesktop: {
    fontSize: 21,
    marginBottom: 18,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 24,
  },

  // Cartão do produto
  produtoCard: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  produtosLinha: {
    gap: 14,
  },
  produtoCardDesktop: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  produtoInativo: {
    opacity: 0.6,
  },
  produtoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  produtoNomeLinha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  produtoNome: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  produtoPreco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  tagInativo: {
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagInativoTexto: {
    fontSize: 9,
    fontWeight: 'bold',
    color: cores.primaria,
  },

  // Botões do cartão
  acoesLinha: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 20,
    paddingVertical: 9,
  },
  btnContorno: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  btnContornoTexto: {
    color: cores.primaria,
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnSucesso: {
    backgroundColor: cores.sucesso,
  },
  btnSucessoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Modal de edição
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 14,
  },
  modalAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnPrimarioModal: {
    backgroundColor: cores.primaria,
  },
});
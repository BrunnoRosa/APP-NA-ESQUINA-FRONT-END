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
  topoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 48,
  },
  buscaInput: {
    flex: 1,
    fontSize: 14,
    color: cores.textoCampo,
    outlineStyle: 'none',   // tira o contorno azul do navegador (só afeta a web)
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
    paddingTop: 28,
    paddingBottom: 40,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 30,
  },

  // Cartão do item do catálogo
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  cardAtivado: {
    opacity: 0.7,
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
  nomeItem: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  subtextItem: {
    fontSize: 11,
    color: cores.textoSecundario,
    marginTop: 3,
  },

  // Botão "Ativar" e selo "Ativado"
  btnAtivar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: cores.primaria,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnAtivarTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seloAtivado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seloAtivadoTexto: {
    color: cores.textoSecundario,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal de preço
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
  },
  modalSubtitulo: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 12,
    color: cores.textoRotulo,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: cores.textoCampo,
    marginBottom: 16,
  },
  modalAcoes: {
    flexDirection: 'row',
    gap: 10,
  },
  btnModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 12,
  },
  btnContorno: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  btnContornoTexto: {
    color: cores.primaria,
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnPrimario: {
    backgroundColor: cores.primaria,
  },
  btnPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
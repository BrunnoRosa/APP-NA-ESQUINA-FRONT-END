import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase,
  },

  // Topo com degradê
  topo: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  topoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    paddingBottom: 12,
    gap: 12,
  },

  // Cartão do item
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 16,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  itemPreco: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.primaria,
    marginTop: 4,
  },
  itemAcoes: {
    alignItems: 'flex-end',
    gap: 10,
  },
  qtdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    gap: 10,
  },
  btnQtd: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtdText: {
    minWidth: 18,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },

  // Rodapé
  rodape: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: cores.divisor,
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRotulo: {
    fontSize: 15,
    color: cores.textoSecundario,
  },
  totalValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 28,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  botaoPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estado vazio
  vazioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  vazioCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cores.fundoCirculo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  vazioSubtitulo: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 12,
  },
});
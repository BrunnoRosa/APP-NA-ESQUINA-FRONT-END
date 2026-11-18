import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase,
  },
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
  botaoComoChegar: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  botaoComoChegarTexto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: cores.primaria,
  },
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
    paddingBottom: 110,
  },
  statusCard: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  statusTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
  horarioTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  horarioTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
  },
  horariosLista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 10,
  },
  horarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  horarioPeriodo: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoTitulo,
  },
  horarioValor: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  horarioFechado: {
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 12,
  },
  carrossel: {
    marginBottom: 22,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 20,
  },
});
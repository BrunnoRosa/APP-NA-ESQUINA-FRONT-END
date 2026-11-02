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
    gap: 14,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },

  // Cartão do pedido
  pedidoCard: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 16,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  lojaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  mercadinhoNome: {
    flex: 1,
    fontSize: 13,
    color: cores.textoSecundario,
  },
  divider: {
    height: 1,
    backgroundColor: '#DCDCDC',
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  itemNome: {
    flex: 1,
    fontSize: 14,
    color: cores.textoTitulo,
  },
  itemPreco: {
    fontSize: 14,
    color: cores.textoSecundario,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCDCDC',
  },
  totalLabel: {
    fontSize: 14,
    color: cores.textoSecundario,
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.primaria,
  },

  // Botão "Já retirei"
  confirmButton: {
    marginTop: 14,
    backgroundColor: cores.primaria,
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Motivo do cancelamento
  motivoContainer: {
    marginTop: 12,
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 12,
    padding: 10,
  },
  motivoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.primaria,
    marginBottom: 2,
  },
  motivoText: {
    fontSize: 13,
    color: cores.textoTitulo,
  },

  // Estado vazio
  vazioCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cores.fundoCirculo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  emptySubtitle: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 12,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  botaoPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
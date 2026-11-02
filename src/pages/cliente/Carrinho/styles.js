import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase || '#F4F5F7',
  },

  // Cabeçalho / Topo
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: cores.degradeInicioBase || '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#333333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#333333',
  },

  // Lista de Itens (Content)
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Cartão de Produto
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.fundoCartao || '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#222222',
  },
  itemPreco: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.primaria || '#28A745',
    marginTop: 4,
  },

  // Controles de Quantidade (+ / -)
  qtdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 4,
    gap: 8,
  },
  btnQtd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.primaria || '#28A745',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnQtdText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtdText: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#333333',
  },

  // Rodapé do Carrinho
  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: cores.divisor || '#EEEEEE',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: cores.textoSecundario || '#666666',
    fontWeight: '600',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.primaria || '#28A745',
  },
  btnFinalizar: {
    backgroundColor: cores.primaria || '#28A745',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnFinalizarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estado de Carrinho Vazio
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#333333',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: cores.textoSecundario || '#777777',
    textAlign: 'center',
  },
});
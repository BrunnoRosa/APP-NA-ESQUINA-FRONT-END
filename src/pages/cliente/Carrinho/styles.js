import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#007BFF',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  itemPreco: {
    fontSize: 13,
    color: '#28A745',
    fontWeight: 'bold',
    marginTop: 2,
  },
  qtdControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  btnQtd: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnQtdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  qtdText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#495057',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
  },
  btnFinalizar: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnFinalizarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 4,
  },
});
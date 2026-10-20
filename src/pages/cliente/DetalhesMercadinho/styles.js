import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1, // Ocupa todo o espaço disponível sem forçar alturas fixas
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60, // Espaço seguro para o final da lista
  },
  btnVoltar: {
    marginBottom: 12,
  },
  btnVoltarText: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  nomeLoja: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  enderecoLoja: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 8,
  },
  badgeStatus: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6C757D',
    marginVertical: 20,
  },
});
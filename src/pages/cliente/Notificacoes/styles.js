import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  btnVoltar: {
    padding: 4,
    marginRight: 12,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#333',
  },
  centroVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoVazio: {
    color: '#A0A4A8',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  cardNaoLido: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  iconeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCard: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  mensagemCard: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  dataCard: {
    fontSize: 11,
    color: '#999',
  },
});
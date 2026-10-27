import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  btnVoltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justify: 'center',
    alignItems: 'center',
  },
  tituloHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#212529',
  },
  espacador: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  vazioTexto: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  btnExplorar: {
    marginTop: 8,
    backgroundColor: cores.primaria || '#E52421',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  btnExplorarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listaContainer: {
    padding: 16,
  },
  colunaWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
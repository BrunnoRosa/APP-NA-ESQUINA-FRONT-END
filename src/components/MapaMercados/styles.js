import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  container: { marginTop: 20 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: cores.textoTitulo || '#212529' },
  subtitulo: { fontSize: 12, color: '#888888', marginTop: 1, marginBottom: 10 },
  linhaCampo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  campo: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.bordaCampo || '#CCCCCC',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    color: cores.textoCampo || '#212529',
    backgroundColor: '#FFFFFF',
  },
  botaoBuscar: {
    marginLeft: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: cores.primaria || '#FF3131',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoBuscarTexto: { color: '#FFFFFF', fontWeight: 'bold' },
  botaoLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.primaria || '#FF3131',
  },
  botaoLocalTexto: { color: cores.primaria || '#FF3131', fontWeight: '600', marginLeft: 6, fontSize: 13 },
  mapaCaixa: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: cores.fundoCartao || '#F0F0F0',
  },
  resumo: { marginTop: 8, fontSize: 13, color: '#6C757D' },
  aviso: { marginTop: 4, fontSize: 12, color: cores.erro || '#D93025' },
});

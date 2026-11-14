import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  rotulo: { fontSize: 13, color: cores.textoRotulo || '#6C757D', marginBottom: 6 },
  linha: { flexDirection: 'row', alignItems: 'center' },
  previa: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: { width: '100%', height: '100%' },
  botoes: { marginLeft: 14, flex: 1, alignItems: 'flex-start' },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.primaria,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  botaoTexto: { color: cores.primaria, fontWeight: '600', fontSize: 13, marginLeft: 6 },
  remover: { color: cores.erro, fontSize: 12, textDecorationLine: 'underline' },
});

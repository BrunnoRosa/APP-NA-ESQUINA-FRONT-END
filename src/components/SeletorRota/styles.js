// components/SeletorRota/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  folha: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.textoTitulo },
  endereco: { fontSize: 13, color: cores.textoSecundario, marginTop: 4, marginBottom: 12 },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3E3',
  },
  opcaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  opcaoInfo: { flex: 1 },
  opcaoNome: { fontSize: 15, fontWeight: '700', color: cores.textoTitulo },
  opcaoDescricao: { fontSize: 12, color: cores.textoSecundario, marginTop: 1 },

  cancelar: { alignItems: 'center', paddingTop: 16 },
  cancelarTexto: { fontSize: 15, fontWeight: '700', color: cores.textoSecundario },
});

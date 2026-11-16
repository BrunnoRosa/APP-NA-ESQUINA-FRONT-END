// components/BotaoComoChegar/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.primaria,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  botaoCompacto: { paddingVertical: 7, paddingHorizontal: 12, gap: 5 },
  botaoTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  botaoTextoCompacto: { fontSize: 12 },
});
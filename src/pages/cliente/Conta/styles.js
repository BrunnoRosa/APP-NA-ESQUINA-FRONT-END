import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.degradeInicioBase },

  // Topo
  topo: {
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetra: { fontSize: 36, fontWeight: 'bold', color: cores.primaria },
  nome: { fontSize: 22, fontWeight: 'bold', color: cores.textoTitulo },
  email: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },

  // Folha branca
  folha: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  conteudo: { padding: 20, paddingBottom: 120, gap: 12 },

  secao: { fontSize: 16, fontWeight: 'bold', color: cores.textoTitulo },
  cartao: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  divisor: { height: 1, backgroundColor: '#E2E2E2' },

  // Linha do menu
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  itemIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexto: { flex: 1, fontSize: 15, color: cores.textoTitulo },
  selo: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  // Sair
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.primaria,
    borderRadius: 28,
    height: 52,
    marginTop: 8,
  },
  botaoSairTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  // Modal "Sobre"
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCaixa: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  modalIcone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.fundoCirculo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: cores.textoTitulo },
  modalTexto: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center' },
  modalRodape: { fontSize: 12, color: cores.textoRotulo },
  modalBotao: {
    alignSelf: 'stretch',
    backgroundColor: cores.primaria,
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalBotaoTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
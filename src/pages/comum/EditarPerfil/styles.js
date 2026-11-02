import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.degradeInicioBase },

  topo: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 44 },
  topoLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  botaoVoltar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 24, fontWeight: 'bold', color: cores.textoTitulo },
  subtitulo: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },

  folha: {
    flex: 1, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28, overflow: 'hidden',
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 12 },

  secao: { fontSize: 16, fontWeight: 'bold', color: cores.textoTitulo, marginTop: 4 },
  cartao: { backgroundColor: cores.fundoCartao, borderRadius: 20, padding: 16, gap: 12 },
  linha: { flexDirection: 'row', gap: 12 },

  grupo: { gap: 4 },
  rotulo: { fontSize: 12, color: cores.textoRotulo },
  campo: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: cores.bordaCampo,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: cores.textoCampo,
  },
  campoErro: { borderColor: cores.erro },
  campoBloqueado: { backgroundColor: '#EDEDED', color: cores.textoSecundario },
  textoErro: { fontSize: 12, color: cores.erro },

  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: cores.fundoVerMais, borderWidth: 1, borderColor: cores.primaria,
    borderRadius: 14, padding: 12,
  },
  avisoOk: { backgroundColor: '#EAF9E7', borderColor: cores.sucesso },
  avisoTexto: { flex: 1, fontSize: 13, color: cores.textoTitulo },

  linkSenha: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  linkSenhaTexto: { color: cores.primaria, fontSize: 14, fontWeight: 'bold' },

  botaoSalvar: {
    backgroundColor: cores.primaria, borderRadius: 28, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  botaoSalvarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
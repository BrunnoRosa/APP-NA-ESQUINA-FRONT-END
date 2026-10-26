import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeTopo,
  },
  fotoFundo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  camadaLaranja: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 172, 39, 0.35)',
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  logo: {
    width: 90,
    height: 108,
    alignSelf: 'center',
    marginBottom: -54,
    zIndex: 2,
  },
  cartao: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: cores.fundoCartaoLogin,
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  seletor: {
    flexDirection: 'row',
    backgroundColor: cores.fundoSeletor,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  opcao: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  opcaoAtiva: {
    backgroundColor: '#FFFFFF',
  },
  opcaoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.textoSeletorInativo,
  },
  opcaoTextoAtivo: {
    color: cores.textoLogin,
  },
  rotulo: {
    color: cores.textoRotulo,
    fontSize: 12,
    marginBottom: 6,
  },
  campo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: cores.textoCampo,
    marginBottom: 16,
  },
  campoSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  campoSenhaInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: cores.textoCampo,
  },
  subtitulo: {
    color: cores.textoLogin,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  linhaHorarios: {
    flexDirection: 'row',
    gap: 12,
  },
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  textoRodape: {
    color: cores.textoRotulo,
    fontSize: 12,
  },
  linkVermelho: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: '700',
  },
});
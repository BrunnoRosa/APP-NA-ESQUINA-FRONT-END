import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeTopo, // reserva enquanto a foto carrega
  },
  fotoFundo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  camadaLaranja: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 172, 39, 0.35)', // valor estimado
  },
  conteudo: {
    flexGrow: 1,                  // permite centralizar e também rolar em telas baixas
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  logo: {
    width: 90,                    // tamanho estimado a partir da imagem
    height: 108,
    alignSelf: 'center',
    marginBottom: -54,            // "afunda" a logo no cartão (metade da altura)
    zIndex: 2,                    // fica por cima do cartão
  },
  cartao: {
    width: '100%',
    maxWidth: 420,                // em tela grande (navegador) o cartão não estica
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
  topico: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  topicoTexto: {
    color: cores.textoLogin,
    fontSize: 15,
    fontWeight: '600',
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
    flexDirection: 'row',         // texto e olho lado a lado
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  campoSenhaInput: {
    flex: 1,                      // o texto ocupa o espaço que sobra
    paddingVertical: 12,
    fontSize: 14,
    color: cores.textoCampo,
  },
  linhaOpcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lembrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoOpcao: {
    color: cores.textoRotulo,
    fontSize: 12,
  },
  linkVermelho: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: '700',
  },
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
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

  // --- validação ---
  campoErro: {
    borderColor: cores.erro,
  },
  textoErro: {
    color: cores.erro,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
  },
  textoDica: {
    color: cores.textoRotulo,
    fontSize: 11,
    marginTop: -10,
    marginBottom: 14,
  },
  avisoFormulario: {
    color: cores.erro,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
});

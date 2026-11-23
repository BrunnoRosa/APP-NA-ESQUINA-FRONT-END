import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 200,
    height: 90,
    alignSelf: 'center',
    marginBottom: 24,
  },

  // Cartão (mesmo estilo do Login)
  cartao: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: cores.fundoCartaoLogin,
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },

  // Campo
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
  campoErro: {
    borderColor: cores.erro,
  },
  textoErro: {
    color: cores.erro,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
  },

  // Botão
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

  // Link voltar
  linkVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkVoltarTexto: {
    color: cores.textoLogin,
    fontSize: 14,
    fontWeight: '600',
  },

  // Campo de senha com o "olho" (igual ao Login)
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
  // Código de 6 dígitos: grande e espaçado
  campoCodigo: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
  },
  emailDestaque: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoLogin,
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 18,
  },
  botaoDesativado: {
    opacity: 0.55,
  },
  botaoSecundario: {
    backgroundColor: cores.fundoBotaoSecundario,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoSecundarioTexto: {
    color: cores.primaria,
    fontSize: 15,
    fontWeight: '600',
  },
});

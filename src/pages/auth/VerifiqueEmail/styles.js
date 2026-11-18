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
  iconeArea: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.fundoVerMais,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailDestaque: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.textoLogin,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  dica: {
    fontSize: 12,
    color: cores.textoRotulo,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  aviso: {
    fontSize: 12,
    color: cores.laranjaDistancia,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },

  // Botões
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoDesativado: {
    opacity: 0.55,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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

import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: cores.fundoCartao,
    borderRadius: 24,
    padding: 12,
    marginRight: 12,
  },
  verMais: {
    alignSelf: 'flex-end',
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 6,
  },
  verMaisTexto: {
    color: cores.primaria,
    fontSize: 11,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTexto: {
    fontSize: 26,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  nome: {
    fontSize: 17,
    color: cores.textoTitulo,
  },
  selo: {
    alignSelf: 'flex-start',
    backgroundColor: cores.sucesso,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  seloFechado: {
    backgroundColor: '#9A9A9A',
  },
  seloTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  distancia: {
    fontSize: 13,
    fontWeight: 'bold',
    color: cores.laranjaDistancia,
  },
});
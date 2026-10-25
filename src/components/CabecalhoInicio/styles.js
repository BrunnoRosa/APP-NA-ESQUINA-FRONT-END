import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 40, // espaço para a folha branca "subir" por cima depois
  },
  linhaEndereco: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  endereco: {
    fontSize: 12,
    color: cores.textoEndereco,
  },
  linhaSaudacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saudacao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textoSaudacao,
  },
  logo: {
    width: 36,
    height: 43,
  },
  linhaBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  campoBusca: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    height: 44,
  },
  inputBusca: {
    flex: 1,
    fontSize: 14,
    color: cores.textoCampo,
    outlineStyle: 'none', // tira o contorno azul no navegador
  },
  botaoFiltro: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoCoracao: {
    backgroundColor: cores.primaria,
  },
  botaoSino: {
    backgroundColor: '#FFFFFF',
  },
  pontoAviso: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.primaria,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
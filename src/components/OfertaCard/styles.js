import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    width: 150,
    backgroundColor: cores.fundoCartao,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
  },
  foto: {
    height: 90,
    borderRadius: 12,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  nome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    minHeight: 36, // reserva 2 linhas: os cartões ficam do mesmo tamanho
  },
  mercadinho: {
    fontSize: 11,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  preco: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  botaoAdd: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
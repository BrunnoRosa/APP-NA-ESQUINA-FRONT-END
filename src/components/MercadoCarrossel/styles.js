import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    width: 190,
    backgroundColor: cores.fundoCartao,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
  },
  foto: {
    height: 100,
    borderRadius: 12,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  selo: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: cores.sucesso,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  seloTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  nome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  endereco: {
    flex: 1,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  distancia: {
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.primaria,
    marginTop: 4,
  },
});
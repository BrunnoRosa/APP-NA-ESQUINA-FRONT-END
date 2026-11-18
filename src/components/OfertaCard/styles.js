import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    width: 158,
    backgroundColor: cores.fundoCartao,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  foto: {
    height: 92,
    borderRadius: 12,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  seloDestaque: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seloDestaqueTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  nome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    minHeight: 36,
  },
  lojaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  mercadinho: {
    flex: 1,
    fontSize: 11,
    color: cores.textoSecundario,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  precoBloco: {
    flex: 1,
    paddingRight: 4,
  },
  porApenas: {
    fontSize: 10,
    color: cores.textoSecundario,
    marginBottom: -1,
  },
  precoLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  cifrao: {
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  valor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  botaoAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
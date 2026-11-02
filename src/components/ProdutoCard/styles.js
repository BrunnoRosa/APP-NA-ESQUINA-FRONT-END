import { StyleSheet } from 'react-native';
import { cores } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imagem: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nomeLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  nome: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  destaqueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: cores.fundoVerMais,
    borderColor: cores.primaria,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  destaqueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  mercadinhoNome: {
    fontSize: 12,
    color: cores.textoSecundario,
    flexShrink: 1,
  },
  distanciaText: {
    fontSize: 12,
    color: cores.laranjaDistancia,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  btnAdd: {
    backgroundColor: cores.primaria,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btnAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
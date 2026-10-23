import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    position: 'relative',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  destaqueTag: {
    position: 'absolute',
    top: 6,
    right: 8, // Alterado de left para right para não ficar em cima da imagem do produto
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  destaqueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageEmoji: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
    paddingRight: 60, // Evita que o nome do produto encoste no badge de Destaque
  },
  // Novo container para alinhar Nome do Mercadinho e Distância em linha
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  mercadinhoNome: {
    fontSize: 12,
    color: '#6C757D', // Ajustado para cinza elegante (já que o azul destaca a distância)
    fontWeight: '500',
    marginRight: 8,
  },
  distanciaText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },
  btnAdd: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
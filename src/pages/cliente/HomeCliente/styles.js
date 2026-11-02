import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeTopo || '#FFDF6D',
  },

  /* Folha branca arredondada que sobe sobre o fundo amarelo */
  folha: {
    backgroundColor: cores.fundo || '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    minHeight: 600,
  },

  /* Atalhos principais */
  atalhosLinha: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  atalhoItem: {
    alignItems: 'center',
    gap: 8,
  },
  atalhoCirculo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.fundoCirculo || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  atalhoNome: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario || '#555555',
  },

  /* Container das Seções da Home */
  secaoContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#212529',
    marginBottom: 12,
  },

  /* Título da Seção de Ofertas + Subtítulo */
  tituloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo || '#212529',
  },
  subtituloSecao: {
    fontSize: 12,
    color: '#888888',
    marginTop: 1,
  },
  verMaisBtn: {
    borderWidth: 1,
    borderColor: cores.primaria || '#E52421',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  verMais: {
    fontSize: 12,
    fontWeight: 'bold',
    color: cores.primaria || '#E52421',
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6C757D',
    marginVertical: 20,
  },

  /* Botão do Carrinho Flutuante com Badge */
  botaoCarrinho: {
    position: 'absolute',
    right: 16,
    bottom: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.primaria || '#E52421',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 999,
  },
  badgeCarrinho: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: cores.primaria || '#E52421',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeCarrinhoTexto: {
    color: cores.primaria || '#E52421',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
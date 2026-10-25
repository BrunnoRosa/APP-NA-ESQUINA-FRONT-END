import { StyleSheet } from 'react-native';

import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    marginTop: 8,
  },
  categoriesScroll: {
    marginBottom: 20,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  bannerCard: {
    backgroundColor: '#007BFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#E3F2FD',
    fontSize: 12,
  },
  bannerEmoji: {
    fontSize: 40,
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

    sessaoItem: {
    alignItems: 'center',
    marginRight: 14,
  },
  sessaoCirculo: {
    width: 88,                  // tamanho estimado a partir da imagem
    height: 88,
    borderRadius: 44,           // metade do tamanho = círculo
    backgroundColor: cores.fundoCirculo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessaoCirculoAtivo: {
    borderColor: cores.primaria, // contorno vermelho na sessão escolhida (decisão nossa)
  },
  sessaoEmoji: {
    fontSize: 40,
  },
  sessaoNome: {
    marginTop: 6,
    fontSize: 13,
    color: cores.textoSecundario,
  },

  folha: {
  backgroundColor: cores.fundo,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  marginTop: -28,          // sobe por cima do degradê
  marginHorizontal: -16,   // ocupa a largura toda
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 8,
},
atalhosLinha: {
  flexDirection: 'row',
  justifyContent: 'space-around',
},
atalhoItem: {
  alignItems: 'center',
  gap: 8,
},
atalhoCirculo: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: cores.fundoCirculo,
  justifyContent: 'center',
  alignItems: 'center',
},
atalhoNome: {
  fontSize: 13,
  color: cores.textoSecundario,
},
});
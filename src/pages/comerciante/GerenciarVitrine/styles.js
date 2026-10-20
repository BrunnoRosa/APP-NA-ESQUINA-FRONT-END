import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#795548',
    lineHeight: 18,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nomeProduto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  precoProduto: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#28A745',
    marginTop: 2,
  },
  btnDestaque: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnDestaqueAtivo: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  btnDestaqueInativo: {
    backgroundColor: '#F8F9FA',
    borderColor: '#CED4DA',
  },
  btnDestaqueTextAtivo: {
    color: '#F57F17',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnDestaqueTextInativo: {
    color: '#6C757D',
    fontSize: 12,
  },
});
import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeInicioBase,
  },

  // Topo
  topo: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  subtitulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  // Folha branca
  folha: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  lista: {
    padding: 20,
    paddingBottom: 30,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 30,
  },

  // Bloco de explicação
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  bannerIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 3,
  },
  bannerTexto: {
    fontSize: 12,
    color: cores.textoSecundario,
    lineHeight: 17,
  },

  // Cartão do produto
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  foto: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  nomeProduto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  precoProduto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.primaria,
    marginTop: 2,
  },

  // Botão de destaque
  btnDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnDestaqueAtivo: {
    backgroundColor: cores.primaria,
  },
  btnDestaqueInativo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  btnTextoAtivo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnTextoInativo: {
    color: cores.primaria,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
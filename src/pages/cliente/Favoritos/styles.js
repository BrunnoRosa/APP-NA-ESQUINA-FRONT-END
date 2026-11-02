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
  topoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 12,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },

  // Cartão da loja
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  foto: {
    width: 68,
    height: 68,
    borderRadius: 16,
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
    gap: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  linhaEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  endereco: {
    flex: 1,
    fontSize: 12,
    color: cores.textoSecundario,
  },
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
  },
  seloTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  botaoCoracao: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Estado vazio
  vazioCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cores.fundoCirculo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 12,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  botaoPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
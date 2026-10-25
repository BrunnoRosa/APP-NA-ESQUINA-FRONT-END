import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.degradeTopo, // provisório, até entrar a foto
  },
    fotoFundo: {
    ...StyleSheet.absoluteFillObject, // cola nas quatro bordas
    width: '100%',                    // largura total da tela
    height: '100%',                   // altura total da tela
  },
    camadaLaranja: {
    ...StyleSheet.absoluteFillObject,       // cobre a tela inteira
    backgroundColor: 'rgba(253, 172, 39, 0.35)', // laranja translúcido (valor estimado)
  },
  areaLogo: {
    flex: 1,                   // ocupa o espaço acima do cartão
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,                // tamanho estimado a partir da imagem
    height: 204,               // mantém a proporção 512:614 da logo
  },
  cartao: {
    backgroundColor: cores.fundoCartaoLogin,
    borderTopLeftRadius: 40,   // cantos de cima bem arredondados
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  botaoPrincipal: {
    backgroundColor: cores.primaria,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoSecundario: {
    backgroundColor: cores.fundoBotaoSecundario,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  textoBotaoSecundario: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: '600',
  },
});
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
    gap: 12,
  },
  saudacao: {
    fontSize: 13,
    color: cores.textoSaudacao,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.textoTitulo,
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
  conteudo: {
    padding: 20,
    paddingBottom: 30,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.textoTitulo,
    marginBottom: 12,
  },

  // Aviso (loja não identificada)
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.fundoVerMais,
    borderWidth: 1,
    borderColor: cores.primaria,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: cores.textoTitulo,
  },

  // Métricas
  metricasLinha: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 16,
  },
  metricaValorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricaValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: cores.primaria,
  },
  metricaRotulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginTop: 2,
  },

  // Ações rápidas
  acaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  acaoIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acaoTextos: {
    flex: 1,
  },
  acaoTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: cores.textoTitulo,
  },
  acaoDescricao: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
    lineHeight: 17,
  },

  
  // Minha conta (mesmo visual da tela Conta do cliente)
  cartaoMenu: {
    backgroundColor: cores.fundoCartao,
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  itemIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexto: { flex: 1, fontSize: 15, color: cores.textoTitulo },

  // Sair (igual ao da tela Conta do cliente)
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.primaria,
    borderRadius: 28,
    height: 52,
    marginTop: 8,
  },
  botaoSairTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
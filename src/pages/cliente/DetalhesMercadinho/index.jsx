import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BotaoCarrinho from '../../../components/BotaoCarrinho';
import OfertaCard from '../../../components/OfertaCard';
import ProdutoCard from '../../../components/ProdutoCard';
import SeletorRota from '../../../components/SeletorRota';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { estaAberto, formatarHorariosDetalhados } from '../../../utils/mercado';
import { styles } from './styles';
import ScrollHorizontal from '../../../components/ScrollHorizontal';

const CRITERIOS_RESUMO = [
  { label: 'Atendimento', chave: 'mediaAtendimento' },
  { label: 'Produtos', chave: 'mediaProdutos' },
  { label: 'Localização', chave: 'mediaLocalizacao' },
  { label: 'Agilidade', chave: 'mediaAgilidade' },
  { label: 'Custo-benefício', chave: 'mediaCustoBeneficio' },
];

function formatarDataAvaliacao(valor) {
  if (!valor) return '';
  if (Array.isArray(valor)) {
    const [ano, mes, dia] = valor;
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
  }
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR');
}

export default function DetalhesMercadinho({ route, navigation }) {
  const { idMercadinho, mercadinho: mercadinhoParam } = route.params || {};

  const [mercadinho, setMercadinho] = useState(mercadinhoParam || null);
  const [produtos, setProdutos] = useState([]);
  const [resumoAvaliacoes, setResumoAvaliacoes] = useState(null);
  const [verTodasAvaliacoes, setVerTodasAvaliacoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarRota, setMostrarRota] = useState(false);

  const scrollViewRef = useRef(null);
  const [posicaoAvaliacoesY, setPosicaoAvaliacoesY] = useState(0);

  const { adicionarAoCarrinho } = useCarrinho();

  const idMercadinhoAtual =
    idMercadinho ||
    mercadinhoParam?.id ||
    mercadinhoParam?.idMercadinho ||
    mercadinho?.id ||
    mercadinho?.idMercadinho;

  const handleAdicionarProduto = (item) => {
    const produtoComMercadinho = {
      ...item,
      idMercadinho: idMercadinhoAtual || item?.idMercadinho || item?.mercadinhoId,
    };

    adicionarAoCarrinho(produtoComMercadinho, idMercadinhoAtual);
  };

  const carregarDadosMercadinho = useCallback(async () => {
    try {
      const id = idMercadinhoAtual || 1;

      if (!mercadinhoParam) {
        const resMercadinho = await api.get(`/api/mercadinhos/${id}`);
        setMercadinho(resMercadinho.data);
      }

      const [resProdutos, resAvaliacoes] = await Promise.all([
        api.get(`/api/produtos/mercadinho/${id}`),
        api.get(`/api/avaliacoes/mercadinho/${id}`).catch(() => ({ data: null })),
      ]);

      setProdutos(resProdutos.data || []);
      if (resAvaliacoes?.data) {
        setResumoAvaliacoes(resAvaliacoes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do mercadinho:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinhoAtual, mercadinhoParam]);

  useFocusEffect(
    useCallback(() => {
      carregarDadosMercadinho();

      const intervalId = setInterval(() => {
        carregarDadosMercadinho();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDadosMercadinho])
  );

  function rolarParaAvaliacoes() {
    scrollViewRef.current?.scrollTo({
      y: posicaoAvaliacoesY,
      animated: true,
    });
  }

  const produtosAtivos = produtos.filter((p) => p.ativo !== false);
  const destaques = produtosAtivos.filter((p) => p.emDestaque);

  const aberto = Boolean(estaAberto(mercadinho));
  const horariosDetalhados = formatarHorariosDetalhados(mercadinho);

  const totalAvaliacoes = resumoAvaliacoes?.totalAvaliacoes || 0;
  const mediaGeral = Number(resumoAvaliacoes?.mediaGeral || 0);
  const listaAvaliacoes = resumoAvaliacoes?.avaliacoes || [];
  const avaliacoesVisiveis = verTodasAvaliacoes
    ? listaAvaliacoes
    : listaAvaliacoes.slice(0, 3);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
        </TouchableOpacity>

        <Text style={styles.nomeLoja} numberOfLines={2}>
          {mercadinho?.nomeFantasia || 'Mercadinho Local'}
        </Text>

        <View style={styles.enderecoLinha}>
          <Ionicons name="location-outline" size={15} color={cores.textoEndereco} />
          <Text style={styles.enderecoLoja} numberOfLines={2}>
            {mercadinho?.endereco || 'Endereço não informado'}
          </Text>
        </View>

        <View style={styles.acoesTopoLinha}>
          {mercadinho && (
            <TouchableOpacity
              style={styles.botaoComoChegar}
              onPress={() => setMostrarRota(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-outline" size={16} color={cores.primaria} />
              <Text style={styles.botaoComoChegarTexto}>Como chegar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.botaoNotaTopo}
            onPress={rolarParaAvaliacoes}
            activeOpacity={0.85}
          >
            <Ionicons name="star" size={15} color="#F59E0B" />
            <Text style={styles.botaoNotaTopoTexto}>
              {totalAvaliacoes > 0
                ? `${mediaGeral.toFixed(1)} (${totalAvaliacoes})`
                : 'Sem avaliações'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statusCard}>
            <View style={styles.statusTopo}>
              <View
                style={[
                  styles.seloStatus,
                  { backgroundColor: aberto ? cores.sucesso : '#9E9E9E' },
                ]}
              >
                <Text style={styles.seloTexto}>
                  {aberto ? 'Aberto' : 'Fechado'}
                </Text>
              </View>
              <View style={styles.horarioTituloLinha}>
                <Ionicons name="time-outline" size={15} color={cores.textoSecundario} />
                <Text style={styles.horarioTitulo}>Horário de funcionamento</Text>
              </View>
            </View>

            {horariosDetalhados.length > 0 ? (
              <View style={styles.horariosLista}>
                {horariosDetalhados.map((item) => (
                  <View key={item.periodo} style={styles.horarioItem}>
                    <Text style={styles.horarioPeriodo}>{item.periodo}:</Text>
                    <Text
                      style={[
                        styles.horarioValor,
                        !item.aberto && styles.horarioFechado,
                      ]}
                    >
                      {item.horario}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={cores.primaria}
              style={{ marginVertical: 30 }}
            />
          ) : (
            <>
              {destaques.length > 0 && (
                <>
                  <Text style={styles.secaoTitulo}>Destaques da loja</Text>
                  <ScrollHorizontal
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.carrossel}
                  >
                    {destaques.map((item) => (
                      <OfertaCard
                        key={String(item.idProduto || item.id)}
                        produto={item}
                        onAdicionar={() => handleAdicionarProduto(item)}
                      />
                    ))}
                  </ScrollHorizontal>
                </>
              )}

              <Text style={styles.secaoTitulo}>
                Todos os produtos ({produtosAtivos.length})
              </Text>
              {produtosAtivos.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum produto cadastrado nesta loja.
                </Text>
              ) : (
                produtosAtivos.map((item) => (
                  <ProdutoCard
                    key={String(item.idProduto || item.id)}
                    produto={item}
                    onAdicionar={handleAdicionarProduto}
                  />
                ))
              )}

              <View
                style={styles.avaliacoesSecao}
                onLayout={(e) => setPosicaoAvaliacoesY(e.nativeEvent.layout.y)}
              >
                <Text style={styles.secaoTitulo}>
                  Avaliações dos clientes ({totalAvaliacoes})
                </Text>

                {totalAvaliacoes === 0 ? (
                  <View style={styles.semAvaliacoesCard}>
                    <Ionicons name="star-outline" size={28} color="#F59E0B" />
                    <Text style={styles.semAvaliacoesTexto}>
                      Este mercadinho ainda não recebeu avaliações. Conclua um
                      pedido para ser o primeiro a avaliar!
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.avaliacoesResumoCard}>
                      <View style={styles.notaGeralBox}>
                        <Text style={styles.notaGeralNumero}>
                          {mediaGeral.toFixed(1)}
                        </Text>
                        <View style={styles.estrelasRow}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Ionicons
                              key={n}
                              name={
                                n <= Math.round(mediaGeral)
                                  ? 'star'
                                  : 'star-outline'
                              }
                              size={15}
                              color="#F59E0B"
                            />
                          ))}
                        </View>
                        <Text style={styles.totalAvaliacoesTexto}>
                          {totalAvaliacoes}{' '}
                          {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
                        </Text>
                      </View>

                      <View style={styles.criteriosLista}>
                        {CRITERIOS_RESUMO.map((crit) => {
                          const valor = Number(resumoAvaliacoes?.[crit.chave] || 0);
                          const percentual = Math.min(100, Math.max(0, (valor / 5) * 100));
                          return (
                            <View key={crit.chave} style={styles.criterioLinha}>
                              <Text style={styles.criterioLabel} numberOfLines={1}>
                                {crit.label}
                              </Text>
                              <View style={styles.barraFundo}>
                                <View
                                  style={[
                                    styles.barraPreenchida,
                                    { width: `${percentual}%` },
                                  ]}
                                />
                              </View>
                              <Text style={styles.criterioValor}>
                                {valor.toFixed(1)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    {avaliacoesVisiveis.map((av) => (
                      <View key={String(av.idAvaliacao)} style={styles.avaliacaoCard}>
                        <View style={styles.avaliacaoCardTopo}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.avaliacaoCliente} numberOfLines={1}>
                              {av.nomeCliente || 'Cliente'}
                            </Text>
                            {!!av.dataAvaliacao && (
                              <Text style={styles.avaliacaoData}>
                                {formatarDataAvaliacao(av.dataAvaliacao)}
                              </Text>
                            )}
                          </View>

                          <View style={styles.avaliacaoNotaMini}>
                            <Ionicons name="star" size={13} color="#F59E0B" />
                            <Text style={styles.avaliacaoNotaMiniTexto}>
                              {Number(av.notaGeral || 0).toFixed(1)}
                            </Text>
                          </View>
                        </View>

                        {!!av.comentario && (
                          <Text style={styles.avaliacaoComentario}>
                            {av.comentario}
                          </Text>
                        )}
                      </View>
                    ))}

                    {listaAvaliacoes.length > 3 && (
                      <TouchableOpacity
                        style={styles.botaoVerMaisAvaliacoes}
                        onPress={() => setVerTodasAvaliacoes((prev) => !prev)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.botaoVerMaisAvaliacoesTexto}>
                          {verTodasAvaliacoes
                            ? 'Mostrar menos'
                            : `Ver todas as ${listaAvaliacoes.length} avaliações`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <BotaoCarrinho navigation={navigation} bottom={30} />

      <SeletorRota
        visivel={mostrarRota}
        mercado={mercadinho}
        onFechar={() => setMostrarRota(false)}
      />
    </View>
  );
}
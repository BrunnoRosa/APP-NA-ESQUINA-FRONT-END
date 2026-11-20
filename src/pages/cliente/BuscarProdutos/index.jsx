import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BotaoCarrinho from '../../../components/BotaoCarrinho';
import LojaCard from '../../../components/LojaCard';
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import { useLocalizacao } from '../../../context/LocalizacaoContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { calcularDistanciaKm, ordenarAbertasPrimeiro } from '../../../utils/mercado';
import { styles } from './styles';

const CATEGORIAS = ['TODAS', 'ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'HORTIFRUTI', 'PADARIA', 'OUTROS'];

const isPromocaoAtiva = (p) =>
  p?.emPromocao === true &&
  p?.precoPromocional !== null &&
  p?.precoPromocional !== undefined &&
  Number(p.precoPromocional) > 0 &&
  Number(p.precoPromocional) < Number(p.preco);

export default function BuscarProdutos({ navigation, route }) {
  const [termo, setTermo] = useState('');
  const categorias = CATEGORIAS;
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('preco');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [lojas, setLojas] = useState([]);
  const [lojasPerto, setLojasPerto] = useState([]);
  const [mediasAvaliacoes, setMediasAvaliacoes] = useState({});

  const [modoAba, setModoAba] = useState(null);
  const [apenasPromocoes, setApenasPromocoes] = useState(false);

  const { origem } = useLocalizacao();
  const userCoords = origem;
  const { adicionarAoCarrinho } = useCarrinho();

  useEffect(() => {
    const params = route?.params;
    if (params) {
      const modo = params.modo || params.aba;

      if (modo === 'mercados') {
        setModoAba('mercados');
        setTermo('');
        setCategoriaAtiva('TODAS');
        setMostrarFiltros(false);
        setApenasPromocoes(false);
      } else if (modo === 'promocoes') {
        setModoAba('promocoes');
        setMostrarFiltros(true);
        setApenasPromocoes(true);
        setTermo('');
      } else if (modo === 'produtos') {
        setModoAba('produtos');
        setMostrarFiltros(true);
        setApenasPromocoes(false);
        setTermo('');
      }
    }
  }, [route?.params?._ts, route?.params?.modo, route?.params?.aba]);

  useFocusEffect(
    useCallback(() => {
      async function carregarLojas() {
        try {
          const [todas, proximas, resMedias] = await Promise.all([
            api.get('/api/mercadinhos'),
            api.get(
              `/api/mercadinhos/proximos?lat=${userCoords.lat}&lng=${userCoords.lng}&raioKm=1`
            ),
            api.get('/api/avaliacoes/medias').catch(() => ({ data: {} })),
          ]);
          setLojas(todas.data || []);
          setLojasPerto(proximas.data || []);
          setMediasAvaliacoes(resMedias.data || {});
        } catch (error) {
          console.error('Erro ao carregar lojas:', error);
        }
      }
      carregarLojas();
    }, [userCoords.lat, userCoords.lng])
  );

  const buscar = useCallback(async () => {
    try {
      setLoading(true);
      const catParam = categoriaAtiva === 'TODAS' ? '' : categoriaAtiva;

      const response = await api.get(
        `/api/produtos/buscar?nome=${encodeURIComponent(termo)}&categoria=${catParam}&ordenarPor=${ordenarPor}&lat=${userCoords.lat}&lng=${userCoords.lng}`
      );
      setProdutos(response.data || []);
    } catch (error) {
      console.error('Erro na busca global:', error);
    } finally {
      setLoading(false);
    }
  }, [termo, categoriaAtiva, ordenarPor, userCoords.lat, userCoords.lng]);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 300);
    return () => clearTimeout(timer);
  }, [termo, categoriaAtiva, ordenarPor, buscar]);

  const alternarOrdenacao = () => {
    setOrdenarPor((prev) => (prev === 'preco' ? 'distancia' : 'preco'));
  };

  const abrirLoja = (m) => {
    const idM = m.idMercadinho || m.id;
    navigation.navigate('DetalhesMercadinho', {
      idMercadinho: idM,
      mercadinho: { ...m, avaliacao: mediasAvaliacoes[String(idM)] || null },
    });
  };

  const modoBusca =
    modoAba === 'produtos' ||
    modoAba === 'promocoes' ||
    apenasPromocoes ||
    termo.trim().length > 0 ||
    categoriaAtiva !== 'TODAS' ||
    mostrarFiltros;

  const produtosExibidos = apenasPromocoes
    ? produtos.filter(isPromocaoAtiva)
    : produtos;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.cabecalho}
      >
        <View style={styles.topo}>
          <View style={styles.campoBusca}>
            <TextInput
              style={styles.inputBusca}
              placeholder={apenasPromocoes ? 'Pesquisar nas promoções' : 'Pesquisar'}
              placeholderTextColor={cores.textoSecundario}
              value={termo}
              onChangeText={(txt) => {
                setTermo(txt);
                if (txt.trim().length > 0 && !apenasPromocoes) setModoAba('produtos');
              }}
            />
            {termo.length > 0 && (
              <TouchableOpacity onPress={() => setTermo('')} style={styles.limpar}>
                <Ionicons name="close-circle" size={18} color={cores.icone} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.botaoFiltro}
              onPress={() => setMostrarFiltros((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Image
            source={require('../../../../assets/images/logo-na-esquina.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        {mostrarFiltros && (
          <View style={styles.filtros}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <TouchableOpacity
                style={[styles.promoChip, apenasPromocoes && styles.promoChipActive]}
                onPress={() => setApenasPromocoes((v) => !v)}
              >
                <Ionicons
                  name="pricetag"
                  size={13}
                  color={apenasPromocoes ? '#FFFFFF' : '#168A00'}
                />
                <Text
                  style={[
                    styles.promoChipText,
                    apenasPromocoes && styles.promoChipTextActive,
                  ]}
                >
                  Só Promoções
                </Text>
              </TouchableOpacity>

              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, categoriaAtiva === cat && styles.categoryChipActive]}
                  onPress={() => setCategoriaAtiva(cat)}
                >
                  <Text
                    style={[styles.categoryText, categoriaAtiva === cat && styles.categoryTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sortRow}>
              <Text style={styles.resultsCount}>
                {produtosExibidos.length} {apenasPromocoes ? 'promoção(ões)' : 'resultado(s)'}
              </Text>
              <TouchableOpacity style={styles.sortBtn} onPress={alternarOrdenacao}>
                <Text style={styles.sortBtnText}>
                  {ordenarPor === 'preco' ? '💰 Menor Preço' : '📍 Menor Distância'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {modoBusca ? (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.primaria} />
            </View>
          ) : (
            <FlatList
              data={produtosExibidos}
              keyExtractor={(item) => String(item.idProduto || item.id || item.idProdutoBase)}
              renderItem={({ item }) => {
                const idLoja =
                  item.idMercadinho ||
                  item.mercadinhoId ||
                  item.mercadinho?.idMercadinho ||
                  item.mercadinho?.id;

                const lojaEncontrada = lojas.find(
                  (l) => Number(l.idMercadinho || l.id) === Number(idLoja)
                );

                const distanciaCalculada =
                  lojaEncontrada && userCoords
                    ? calcularDistanciaKm(
                        userCoords.lat,
                        userCoords.lng,
                        lojaEncontrada.latitude,
                        lojaEncontrada.longitude
                      )
                    : undefined;

                const produtoComDistancia = {
                  ...item,
                  distanciaEmKm:
                    item.distanciaEmKm ??
                    item.distanciaKm ??
                    item.distancia ??
                    distanciaCalculada,
                };

                return (
                  <ProdutoCard
                    produto={produtoComDistancia}
                    onAdicionar={() => adicionarAoCarrinho(produtoComDistancia)}
                  />
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {apenasPromocoes
                    ? 'Nenhum produto em promoção no momento.'
                    : 'Nenhum produto encontrado para esta busca.'}
                </Text>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            />
          )
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={styles.tituloSecao}>Lojas em Destaque</Text>
            {lojas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma loja cadastrada ainda.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carrossel}
              >
                {ordenarAbertasPrimeiro(lojas).map((m) => {
                  const idM = m.idMercadinho || m.id;
                  return (
                    <LojaCard
                      key={String(idM)}
                      mercadinho={m}
                      tipo="destaque"
                      avaliacao={mediasAvaliacoes[String(idM)]}
                      onPress={() => abrirLoja(m)}
                    />
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.divisor} />

            <Text style={styles.tituloSecao}>Perto de você</Text>
            <Text style={styles.subtituloSecao}>(raio de 1km)</Text>
            {lojasPerto.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma loja por perto.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carrossel}
              >
                {ordenarAbertasPrimeiro(lojasPerto).map((m) => {
                  const idM = m.idMercadinho || m.id;
                  return (
                    <LojaCard
                      key={String(idM)}
                      mercadinho={m}
                      tipo="perto"
                      distanciaKm={calcularDistanciaKm(
                        userCoords.lat,
                        userCoords.lng,
                        m.latitude,
                        m.longitude
                      )}
                      avaliacao={mediasAvaliacoes[String(idM)]}
                      onPress={() => abrirLoja(m)}
                    />
                  );
                })}
              </ScrollView>
            )}
          </ScrollView>
        )}
      </View>

      <BotaoCarrinho navigation={navigation} bottom={90} />
    </View>
  );
}
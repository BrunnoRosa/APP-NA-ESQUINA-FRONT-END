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
import ScrollHorizontal from '../../../components/ScrollHorizontal';

const CATEGORIAS = ['TODAS', 'ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'HORTIFRUTI', 'PADARIA', 'OUTROS'];

const isPromocaoAtiva = (p) =>
  p?.emPromocao === true &&
  p?.precoPromocional !== null &&
  p?.precoPromocional !== undefined &&
  Number(p.precoPromocional) > 0 &&
  Number(p.precoPromocional) < Number(p.preco);

// Tira acentos e maiúsculas para comparar: "Açaí Bom" -> "acai bom"
const normalizar = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Um mercadinho "combina" com o termo se o nome, o bairro, a rua ou a cidade tiverem o texto digitado
const mercadoCombina = (m, termoNormalizado) => {
  if (!termoNormalizado) return true;
  const alvo = normalizar(
    [m?.nomeFantasia, m?.bairro, m?.rua, m?.cidade, m?.endereco].filter(Boolean).join(' ')
  );
  return alvo.includes(termoNormalizado);
};

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

  const emMercados = modoAba === 'mercados';

  const buscar = useCallback(async () => {
    // Na aba "Mercados" a pesquisa é feita sobre as lojas (já carregadas), não sobre produtos
    if (emMercados) return;
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
  }, [emMercados, termo, categoriaAtiva, ordenarPor, userCoords.lat, userCoords.lng]);

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

  // Troca entre "Produtos" e "Mercados" pelos botões da própria tela
  const trocarModo = (novo) => {
    setModoAba(novo);
    setTermo('');
    setCategoriaAtiva('TODAS');
    setApenasPromocoes(false);
    setMostrarFiltros(novo === 'produtos');
  };

  const termoNormalizado = normalizar(termo);
  const lojasFiltradas = emMercados
    ? ordenarAbertasPrimeiro(lojas.filter((m) => mercadoCombina(m, termoNormalizado)))
    : [];

  const modoBusca =
    !emMercados &&
    (modoAba === 'produtos' ||
    modoAba === 'promocoes' ||
    apenasPromocoes ||
    termo.trim().length > 0 ||
    categoriaAtiva !== 'TODAS' ||
    mostrarFiltros);

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
              placeholder={
                emMercados
                  ? 'Pesquisar mercados'
                  : apenasPromocoes
                  ? 'Pesquisar nas promoções'
                  : 'Pesquisar produtos'
              }
              placeholderTextColor={cores.textoSecundario}
              value={termo}
              onChangeText={(txt) => {
                setTermo(txt);
                // Sem aba escolhida, digitar pesquisa produtos. Na aba Mercados, continua em mercados.
                if (txt.trim().length > 0 && !apenasPromocoes && !modoAba) setModoAba('produtos');
              }}
            />
            {termo.length > 0 && (
              <TouchableOpacity onPress={() => setTermo('')} style={styles.limpar}>
                <Ionicons name="close-circle" size={18} color={cores.icone} />
              </TouchableOpacity>
            )}
            {!emMercados && (
              <TouchableOpacity
                style={styles.botaoFiltro}
                onPress={() => setMostrarFiltros((v) => !v)}
                activeOpacity={0.8}
              >
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <Image
            source={require('../../../../assets/images/logo-na-esquina.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        <View style={styles.seletorModo}>
          {[
            { chave: 'produtos', rotulo: 'Produtos', icone: 'basket-outline' },
            { chave: 'mercados', rotulo: 'Mercados', icone: 'storefront-outline' },
          ].map((op) => {
            const ativo = op.chave === 'mercados' ? emMercados : !emMercados;
            return (
              <TouchableOpacity
                key={op.chave}
                style={[styles.seletorModoBotao, ativo && styles.seletorModoBotaoAtivo]}
                onPress={() => trocarModo(op.chave)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
              >
                <Ionicons name={op.icone} size={16} color={ativo ? '#FFFFFF' : cores.textoSecundario} />
                <Text style={[styles.seletorModoTexto, ativo && styles.seletorModoTextoAtivo]}>
                  {op.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mostrarFiltros && !emMercados && (
          <View style={styles.filtros}>
            <ScrollHorizontal
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
            </ScrollHorizontal>

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

        {emMercados && termoNormalizado.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          >
            <Text style={styles.resultsCount}>{lojasFiltradas.length} mercado(s) encontrado(s)</Text>
            {lojasFiltradas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum mercado encontrado para esta busca.</Text>
            ) : (
              <View style={styles.listaMercados}>
                {lojasFiltradas.map((m) => {
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
              </View>
            )}
          </ScrollView>
        ) : modoBusca ? (
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
              <ScrollHorizontal
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
              </ScrollHorizontal>
            )}

            <View style={styles.divisor} />

            <Text style={styles.tituloSecao}>Perto de você</Text>
            <Text style={styles.subtituloSecao}>(raio de 1km)</Text>
            {lojasPerto.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma loja por perto.</Text>
            ) : (
              <ScrollHorizontal
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
              </ScrollHorizontal>
            )}
          </ScrollView>
        )}
      </View>

      <BotaoCarrinho navigation={navigation} bottom={90} />
    </View>
  );
}
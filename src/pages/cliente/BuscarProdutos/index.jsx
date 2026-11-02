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
import api from '../../../services/api';
import { cores } from '../../../theme';
import { calcularDistanciaKm, ordenarAbertasPrimeiro } from '../../../utils/mercado';
import { styles } from './styles';

const CATEGORIAS = ['TODAS', 'ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'HORTIFRUTI', 'PADARIA', 'OUTROS'];

const LOCALIZACAO_USUARIO = { lat: -12.9714, lng: -38.5014 };

export default function BuscarProdutos({ navigation, route }) {
  const [termo, setTermo] = useState('');
  const categorias = CATEGORIAS;
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('preco'); // 'preco' ou 'distancia'
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Listas de lojas
  const [lojas, setLojas] = useState([]);
  const [lojasPerto, setLojasPerto] = useState([]);

  // Estado para controlar o modo vindo da navegação (mercados | produtos | promocoes)
  const [modoAba, setModoAba] = useState(null);
  const [apenasPromocoes, setApenasPromocoes] = useState(false);

  const userCoords = LOCALIZACAO_USUARIO;
  const { adicionarAoCarrinho } = useCarrinho();

  // Reage aos parâmetros passados na navegação a partir da HomeCliente
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

  // Carrega as lojas sempre que a aba ganha foco
  useFocusEffect(
    useCallback(() => {
      async function carregarLojas() {
        try {
          const [todas, proximas] = await Promise.all([
            api.get('/api/mercadinhos'),
            api.get(
              `/api/mercadinhos/proximos?lat=${userCoords.lat}&lng=${userCoords.lng}&raioKm=1`
            ),
          ]);
          setLojas(todas.data || []);
          setLojasPerto(proximas.data || []);
        } catch (error) {
          console.error('Erro ao carregar lojas:', error);
        }
      }
      carregarLojas();
    }, [userCoords])
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
  }, [termo, categoriaAtiva, ordenarPor, userCoords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 300);
    return () => clearTimeout(timer);
  }, [termo, categoriaAtiva, ordenarPor, buscar]);

  const alternarOrdenacao = () => {
    setOrdenarPor((prev) => (prev === 'preco' ? 'distancia' : 'preco'));
  };

  const abrirLoja = (m) =>
    navigation.navigate('DetalhesMercadinho', {
      idMercadinho: m.idMercadinho || m.id,
      mercadinho: m,
    });

  // Determina se deve mostrar a lista de produtos ou as seções de lojas
  const modoBusca =
    modoAba === 'produtos' ||
    modoAba === 'promocoes' ||
    termo.trim().length > 0 ||
    categoriaAtiva !== 'TODAS' ||
    mostrarFiltros;

  // Filtra por promoções/destaques quando vindo do botão Promoções
  const produtosExibidos = apenasPromocoes
    ? produtos.filter(
        (p) =>
          p.emDestaque === true ||
          p.destaque === true ||
          p.oferta === true ||
          p.emPromocao === true ||
          String(p.emDestaque) === 'true'
      )
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
              placeholder="Pesquisar"
              placeholderTextColor={cores.textoSecundario}
              value={termo}
              onChangeText={(txt) => {
                setTermo(txt);
                if (txt.trim().length > 0) setModoAba('produtos');
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
              <Text style={styles.resultsCount}>{produtosExibidos.length} resultado(s)</Text>
              <TouchableOpacity style={styles.sortBtn} onPress={alternarOrdenacao}>
                <Text style={styles.sortBtnText}>
                  {ordenarPor === 'preco' ? '💰 Menor Preço' : '📍 Menor Distância'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {modoBusca ? (
          /* Resultados de produtos */
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.primaria} />
            </View>
          ) : (
            <FlatList
              data={produtosExibidos}
              keyExtractor={(item) => String(item.idProduto || item.id || item.idProdutoBase)}
              renderItem={({ item }) => (
                <ProdutoCard produto={item} onAdicionar={() => adicionarAoCarrinho(item)} />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum produto encontrado para esta busca.</Text>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            />
          )
        ) : (
          /* Lojas em Destaque e Perto de você */
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
                {ordenarAbertasPrimeiro(lojas).map((m) => (
                  <LojaCard
                    key={String(m.idMercadinho || m.id)}
                    mercadinho={m}
                    tipo="destaque"
                    onPress={() => abrirLoja(m)}
                  />
                ))}
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
                {ordenarAbertasPrimeiro(lojasPerto).map((m) => (
                  <LojaCard
                    key={String(m.idMercadinho || m.id)}
                    mercadinho={m}
                    tipo="perto"
                    distanciaKm={calcularDistanciaKm(
                      userCoords.lat,
                      userCoords.lng,
                      m.latitude,
                      m.longitude
                    )}
                    onPress={() => abrirLoja(m)}
                  />
                ))}
              </ScrollView>
            )}
          </ScrollView>
        )}
      </View>

      <BotaoCarrinho navigation={navigation} bottom={90} />
    </View>
  );
}
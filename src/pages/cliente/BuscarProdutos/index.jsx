import { Ionicons } from '@expo/vector-icons'; // 🆕 NOVO
import { useFocusEffect } from '@react-navigation/native'; // 🆕 NOVO
import { LinearGradient } from 'expo-linear-gradient'; // 🆕 NOVO
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image, // 🆕 NOVO (logo no topo)
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// 🗑️ REMOVIDO: import do Header azul (o Figma não tem esse cabeçalho na Pesquisar)
import BotaoCarrinho from '../../../components/BotaoCarrinho'; // 🆕
import LojaCard from '../../../components/LojaCard'; // 🆕 NOVO
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕 NOVO
import { calcularDistanciaKm, ordenarAbertasPrimeiro } from '../../../utils/mercado'; // ✏️ ALTERADO
import { styles } from './styles';

// ✏️ ALTERADO: categorias iguais às do backend (enum CategoriaProduto).
// Antes vinham de /api/categorias, que não existe, e o "LATICÍNIOS" não existe no backend.
const CATEGORIAS = ['TODAS', 'ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'HORTIFRUTI', 'PADARIA', 'OUTROS'];

// ✏️ ALTERADO: antes era São Paulo. Agora é Salvador, igual ao cadastro de mercado.
// Quando usarmos o GPS do aparelho, só este valor muda.
const LOCALIZACAO_USUARIO = { lat: -12.9714, lng: -38.5014 };

export default function BuscarProdutos({ navigation }) {
  const [termo, setTermo] = useState('');
  const categorias = CATEGORIAS; // ✏️ ALTERADO: lista fixa (sem useState/useEffect)
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('preco'); // 'preco' ou 'distancia'
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false); // 🆕 NOVO

  // 🆕 NOVO: listas de lojas do Figma
  const [lojas, setLojas] = useState([]);
  const [lojasPerto, setLojasPerto] = useState([]);

  const userCoords = LOCALIZACAO_USUARIO; // ✏️ ALTERADO: constante no lugar do useState
  const { adicionarAoCarrinho } = useCarrinho();

  // 🗑️ REMOVIDO: useEffect que chamava /api/categorias (endpoint inexistente)

  // 🆕 NOVO: carrega as lojas sempre que a aba ganha foco
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

  // 🆕 NOVO: abre a loja (mesma navegação que a Home já usa)
  const abrirLoja = (m) =>
    navigation.navigate('DetalhesMercadinho', {
      idMercadinho: m.idMercadinho || m.id,
      mercadinho: m,
    });

  // 🆕 NOVO: se o usuário está buscando, mostra produtos; senão, mostra as lojas
  const modoBusca = termo.trim().length > 0 || categoriaAtiva !== 'TODAS' || mostrarFiltros;

  return (
    <View style={styles.container}>
      {/* ✏️ ALTERADO: o topo (busca + filtro + logo) fica DENTRO do degradê amarelo.
          Atenção: o LinearGradient abre aqui e só fecha depois da logo. */}
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
              onChangeText={setTermo}
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
      {/* 🆕 NOVO: o degradê fechou na linha acima */}

      {/* 🆕 NOVO: folha branca que contém todo o resto da tela (fecha no fim do arquivo) */}
      <View style={styles.folha}>
        {/* ✏️ ALTERADO: categorias e ordenação só aparecem ao tocar no botão de filtro */}
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
              <Text style={styles.resultsCount}>{produtos.length} resultado(s)</Text>
              <TouchableOpacity style={styles.sortBtn} onPress={alternarOrdenacao}>
                <Text style={styles.sortBtnText}>
                  {ordenarPor === 'preco' ? '💰 Menor Preço' : '📍 Menor Distância'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {modoBusca ? (
          /* Resultados de produtos (lógica original mantida) */
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.primaria} />{/* ✏️ ALTERADO: cor vermelha */}
            </View>
          ) : (
            <FlatList
              data={produtos}
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
          /* 🆕 NOVO: blocos "Lojas em Destaque" e "Perto de você" */
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
      {/* 🆕 NOVO: a folha branca fechou na linha acima */}

      {/* 🆕 Botão flutuante do carrinho (90 = acima da barra de abas, igual à Home) */}
      <BotaoCarrinho navigation={navigation} bottom={90} />
    </View>
  );
}
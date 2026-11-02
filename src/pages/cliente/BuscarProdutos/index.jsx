import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [ordenarPor, setOrdenarPor] = useState('preco');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [exibirProdutos, setExibirProdutos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [somentePromocoes, setSomentePromocoes] = useState(false);

  const [lojas, setLojas] = useState([]);
  const [lojasPerto, setLojasPerto] = useState([]);

  const userCoords = LOCALIZACAO_USUARIO;
  const { adicionarAoCarrinho, totalItens } = useCarrinho();

  useFocusEffect(
    useCallback(() => {
      const modo = route?.params?.modo;

      if (modo === 'promocoes') {
        setExibirProdutos(true);
        setMostrarFiltros(true);
        setSomentePromocoes(true);
      } else if (modo === 'produtos') {
        setExibirProdutos(true);
        setMostrarFiltros(true);
        setSomentePromocoes(false);
      } else {
        setExibirProdutos(false);
        setMostrarFiltros(false);
        setSomentePromocoes(false);
        setTermo('');
        setCategoriaAtiva('TODAS');
      }

      return () => {
        navigation.setParams({ modo: undefined });
      };
    }, [route?.params, navigation])
  );

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      async function carregarLojas() {
        try {
          const [todasLojas, proximasLojas] = await Promise.all([
            api.get('/api/mercadinhos'),
            api.get(
              `/api/mercadinhos/proximos?lat=${userCoords.lat}&lng=${userCoords.lng}&raioKm=1`
            ),
          ]);
          if (!cancelado) {
            setLojas(todasLojas.data || []);
            setLojasPerto(proximasLojas.data || []);
          }
        } catch (error) {
          console.error('Erro ao carregar lojas:', error);
        }
      }

      carregarLojas();

      return () => {
        cancelado = true;
      };
    }, [userCoords])
  );

  // Mapeia produtos associando o ID do Mercadinho via busca profunda se necessário
  const buscar = useCallback(async () => {
    try {
      setLoading(true);
      const catParam = categoriaAtiva === 'TODAS' ? '' : categoriaAtiva;

      const [resProdutos, resLojas] = await Promise.all([
        api.get('/api/produtos'),
        api.get('/api/mercadinhos').catch(() => ({ data: [] })),
      ]);

      let listaBruta = resProdutos.data || [];
      const listaLojas = resLojas.data || [];

      // Monta o mapa de associação idProduto -> idMercadinho
      const mapa = new Map();
      for (const m of listaLojas) {
        const idLoja = m.idMercadinho || m.id;
        const prods = m.produtos || m.produtosDestaque || m.itens || [];
        for (const p of prods) {
          const idP = p.idProduto || p.id;
          if (idP && idLoja) mapa.set(Number(idP), Number(idLoja));
        }
      }

      // Se não encontrou no payload direto, busca os detalhes de cada loja
      if (mapa.size === 0 && listaLojas.length > 0) {
        try {
          const detalhesRes = await Promise.all(
            listaLojas.map((m) => {
              const idL = m.idMercadinho || m.id;
              return api.get(`/api/mercadinhos/${idL}`).catch(() => null);
            })
          );

          for (const res of detalhesRes) {
            if (res?.data) {
              const m = res.data;
              const idLoja = m.idMercadinho || m.id;
              const prods = m.produtos || m.produtosDestaque || m.itens || [];
              for (const p of prods) {
                const idP = p.idProduto || p.id;
                if (idP && idLoja) mapa.set(Number(idP), Number(idLoja));
              }
            }
          }
        } catch (err) {
          console.error('Erro ao buscar detalhes das lojas na busca:', err);
        }
      }

      let lista = listaBruta.map((p) => {
        const idDireto =
          p.idMercadinho ||
          p.mercadinhoId ||
          p.id_mercadinho ||
          (typeof p.mercadinho === 'number' ? p.mercadinho : null) ||
          p.mercadinho?.idMercadinho ||
          p.mercadinho?.id;

        const idFinal = idDireto ? Number(idDireto) : mapa.get(Number(p.idProduto || p.id));

        return {
          ...p,
          idMercadinho: idFinal || null,
        };
      });

      // Filtro de promoções
      if (somentePromocoes) {
        lista = lista.filter(
          (p) =>
            p.emDestaque === true ||
            p.destaque === true ||
            p.oferta === true ||
            String(p.emDestaque) === 'true'
        );
      }

      // Filtro por termo
      if (termo.trim().length > 0) {
        const termoLower = termo.toLowerCase();
        lista = lista.filter((p) =>
          String(p.nome || p.descricao || '').toLowerCase().includes(termoLower)
        );
      }

      // Filtro por categoria
      if (catParam !== '') {
        lista = lista.filter((p) => {
          const catNome =
            typeof p.categoria === 'object'
              ? p.categoria?.nome || p.categoria?.descricao
              : p.categoria;
          return String(catNome || '').toUpperCase() === catParam;
        });
      }

      // Ordenação
      if (ordenarPor === 'preco') {
        lista.sort((a, b) => Number(a.preco || 0) - Number(b.preco || 0));
      }

      setProdutos(lista);
    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, [termo, categoriaAtiva, ordenarPor, somentePromocoes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 300);
    return () => clearTimeout(timer);
  }, [termo, categoriaAtiva, ordenarPor, somentePromocoes, buscar]);

  const alternarOrdenacao = () => {
    setOrdenarPor((prev) => (prev === 'preco' ? 'distancia' : 'preco'));
  };

  const abrirLoja = (m) =>
    navigation.navigate('DetalhesMercadinho', {
      idMercadinho: m.idMercadinho || m.id,
      mercadinho: m,
    });

  const handleAdicionarAoCarrinho = (produto) => {
    adicionarAoCarrinho({
      ...produto,
      idMercadinho: produto.idMercadinho,
    });
  };

  const modoBusca =
    exibirProdutos || termo.trim().length > 0 || categoriaAtiva !== 'TODAS';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.cabecalho}
      >
        <View style={styles.topo}>
          <View style={styles.campoBusca}>
            <TextInput
              style={styles.inputBusca}
              placeholder={
                somentePromocoes
                  ? 'Pesquisar promoções...'
                  : 'Pesquisar produtos ou marcas...'
              }
              placeholderTextColor={cores.textoSecundario}
              value={termo}
              onChangeText={(txt) => {
                setTermo(txt);
                if (txt.length > 0) setExibirProdutos(true);
              }}
            />
            {termo.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setTermo('');
                  if (
                    categoriaAtiva === 'TODAS' &&
                    !mostrarFiltros &&
                    !somentePromocoes
                  ) {
                    setExibirProdutos(false);
                  }
                }}
                style={styles.limpar}
              >
                <Ionicons name="close-circle" size={18} color={cores.icone} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.botaoFiltro}
              onPress={() => {
                setMostrarFiltros((v) => !v);
                setExibirProdutos(true);
              }}
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

      <View style={[styles.folha, { flex: 1 }]}>
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
                  style={[
                    styles.categoryChip,
                    categoriaAtiva === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategoriaAtiva(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      categoriaAtiva === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sortRow}>
              <Text style={styles.resultsCount}>
                {somentePromocoes
                  ? `🔥 ${produtos.length} oferta(s)`
                  : `${produtos.length} produto(s)`}
              </Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={alternarOrdenacao}
              >
                <Text style={styles.sortBtnText}>
                  {ordenarPor === 'preco'
                    ? '💰 Menor Preço'
                    : '📍 Menor Distância'}
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
              data={produtos}
              keyExtractor={(item, index) =>
                String(item.idProduto || item.id || item.idProdutoBase || index)
              }
              renderItem={({ item }) => (
                <ProdutoCard
                  produto={item}
                  onAdicionar={() => handleAdicionarAoCarrinho(item)}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {somentePromocoes
                    ? 'Nenhuma promoção encontrada para esta categoria.'
                    : 'Nenhum produto encontrado para esta busca.'}
                </Text>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
            />
          )
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
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

      {/* Botão Flutuante do Carrinho */}
      {totalItens > 0 && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 25,
            right: 20,
            backgroundColor: cores.secundaria || '#FF3B30',
            width: 58,
            height: 58,
            borderRadius: 29,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            zIndex: 999,
          }}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Carrinho')}
        >
          <Ionicons name="cart" size={26} color="#FFFFFF" />
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
              borderWidth: 1.5,
              borderColor: cores.secundaria || '#FF3B30',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                color: cores.secundaria || '#FF3B30',
              }}
            >
              {totalItens}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BotaoCarrinho from '../../../components/BotaoCarrinho';
import CabecalhoInicio from '../../../components/CabecalhoInicio';
import MapaMercados from '../../../components/MapaMercados';
import MercadoCarrossel from '../../../components/MercadoCarrossel';
import OfertaCard from '../../../components/OfertaCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { ordenarAbertasPrimeiro } from '../../../utils/mercado';
import { styles } from './styles';

const ATALHOS = [
  { chave: 'promocoes', nome: 'Promoções', icone: 'pricetag' },
  { chave: 'produtos', nome: 'Produtos', icone: 'cube' },
  { chave: 'mercados', nome: 'Mercados', icone: 'storefront' },
];

export default function HomeCliente({ navigation }) {
  const [mercadinhos, setMercadinhos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { adicionarAoCarrinho } = useCarrinho();

  // Função para formatar URLs de imagens (Resolve o erro arroz.jpg / ERR_NAME_NOT_RESOLVED)
  const formatarUrlImagem = (url) => {
    if (!url) return null;
    if (typeof url === 'string') {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      const baseURL = api.defaults?.baseURL || 'http://localhost:8080';
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${baseURL}${path}`;
    }
    return url;
  };

  // Função auxiliar para montar o mapa idProduto -> idMercadinho
  const mapearLojasEProdutos = async (listaLojas, listaProdutos) => {
    const mapa = new Map();

    for (const m of listaLojas) {
      const idLoja = m.idMercadinho || m.id;
      const prods = m.produtos || m.produtosDestaque || m.itens || [];
      for (const p of prods) {
        const idP = p.idProduto || p.id;
        if (idP && idLoja) mapa.set(Number(idP), Number(idLoja));
      }
    }

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
        console.error('Erro ao carregar detalhes das lojas:', err);
      }
    }

    return listaProdutos.map((prod) => {
      const idDireto =
        prod.idMercadinho ||
        prod.mercadinhoId ||
        prod.id_mercadinho ||
        (typeof prod.mercadinho === 'number' ? prod.mercadinho : null) ||
        prod.mercadinho?.idMercadinho ||
        prod.mercadinho?.id;

      const idFinal = idDireto ? Number(idDireto) : mapa.get(Number(prod.idProduto || prod.id));
      const imgTratada = formatarUrlImagem(prod.imagemUrl || prod.imagem || prod.foto);

      return {
        ...prod,
        idMercadinho: idFinal || null,
        imagem: imgTratada,
        imagemUrl: imgTratada,
      };
    });
  };

  const carregarDados = useCallback(async () => {
    try {
      const [resMercadinhos, resProdutos, resFavoritos] = await Promise.all([
        api.get('/api/mercadinhos'),
        api.get('/api/produtos').catch(() => ({ data: [] })),
        api.get('/api/clientes/favoritos').catch(() => ({ data: [] })),
      ]);

      const lojas = resMercadinhos.data || [];
      const prodsBrutos = resProdutos.data || [];

      let produtosCompletos = [];

      if (lojas.length > 0) {
        const produtosPorLoja = await Promise.all(
          lojas.map((loja) =>
            api
              .get(`/api/produtos/mercadinho/${loja.idMercadinho || loja.id}`)
              .then((res) =>
                (res.data || []).map((p) => {
                  const imgTratada = formatarUrlImagem(p.imagemUrl || p.imagem || p.foto);
                  return {
                    ...p,
                    idMercadinho: loja.idMercadinho || loja.id,
                    nomeMercadinho: loja.nomeFantasia,
                    imagem: imgTratada,
                    imagemUrl: imgTratada,
                  };
                })
              )
              .catch(() => [])
          )
        );
        produtosCompletos = produtosPorLoja.flat();
      }

      if (produtosCompletos.length === 0 && prodsBrutos.length > 0) {
        produtosCompletos = await mapearLojasEProdutos(lojas, prodsBrutos);
      }

      setMercadinhos(lojas);
      setTodosProdutos(produtosCompletos);

      const ids = (resFavoritos.data || []).map((fav) => fav.idMercadinho || fav.id);
      setFavoritosIds(ids);
    } catch (error) {
      console.error('Erro ao carregar dados da Home:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }, [carregarDados]);

  const toggleFavorito = async (idMercadinho) => {
    const jaEhFavorito = favoritosIds.includes(idMercadinho);

    setFavoritosIds((prev) =>
      jaEhFavorito ? prev.filter((id) => id !== idMercadinho) : [...prev, idMercadinho]
    );

    try {
      if (jaEhFavorito) {
        await api.delete(`/api/clientes/favoritos/${idMercadinho}`);
      } else {
        await api.post(`/api/clientes/favoritos`, { idMercadinho });
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
      setFavoritosIds((prev) =>
        jaEhFavorito ? [...prev, idMercadinho] : prev.filter((id) => id !== idMercadinho)
      );
    }
  };

  const idsMercadinhosProximos = mercadinhos.map((m) => Number(m.idMercadinho || m.id));

  // Produtos destacados e pertencentes aos mercadinhos da região
  const produtosDestaque = todosProdutos.filter((p) => {
    if (p.ativo === false) return false;

    const idLojaProd = Number(
      p.idMercadinho ||
      p.mercadinhoId ||
      p.id_mercadinho ||
      (typeof p.mercadinho === 'number' ? p.mercadinho : null) ||
      p.mercadinho?.idMercadinho ||
      p.mercadinho?.id
    );

    const pertenceAMercadoProximo =
      idsMercadinhosProximos.length === 0 || idsMercadinhosProximos.includes(idLojaProd);

    const ehDestaque =
      p.emDestaque === true ||
      p.destaque === true ||
      p.oferta === true ||
      String(p.emDestaque) === 'true' ||
      p.emPromocao === true;

    return pertenceAMercadoProximo && ehDestaque;
  });

  // Exibe unicamente os produtos que estão em destaque
  const produtosExibidos = produtosDestaque;

  const handleNavegar = (chave) => {
    const ts = Date.now();
    const params =
      chave === 'mercados'
        ? { modo: 'mercados', aba: 'mercados', _ts: ts }
        : chave === 'promocoes'
        ? { modo: 'promocoes', aba: 'produtos', emPromocao: true, emDestaque: true, _ts: ts }
        : { modo: 'produtos', aba: 'produtos', _ts: ts };

    try {
      navigation.navigate('BuscarProdutos', params);
    } catch (e) {
      try {
        navigation.navigate('Pesquisar', params);
      } catch (err) {
        navigation.navigate('Buscar', params);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[cores.primaria || '#FF3131']}
            tintColor={cores.primaria || '#FF3131'}
          />
        }
      >
        <CabecalhoInicio
          navigation={navigation}
          quantidadeFavoritos={favoritosIds.length}
        />

        <View style={styles.folha}>
          <View style={styles.atalhosLinha}>
            {ATALHOS.map((atalho) => (
              <TouchableOpacity
                key={atalho.chave}
                style={styles.atalhoItem}
                activeOpacity={0.7}
                onPress={() => handleNavegar(atalho.chave)}
              >
                <View style={styles.atalhoCirculo}>
                  <Ionicons name={atalho.icone} size={28} color={cores.primaria} />
                </View>
                <Text style={styles.atalhoNome}>{atalho.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <MapaMercados mercadinhos={mercadinhos} navigation={navigation} />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.primaria || '#007BFF'} />
            </View>
          ) : (
            <>
              {categoriaAtiva === 'TODOS' && (
                <View style={styles.secaoContainer}>
                  <Text style={styles.sectionTitle}>Mercadinhos próximos de você</Text>
                  {mercadinhos.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum mercadinho cadastrado ainda.</Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginHorizontal: -16 }}
                      contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                      {ordenarAbertasPrimeiro(mercadinhos).map((m) => {
                        const idM = m.idMercadinho || m.id;
                        const isFavorito = favoritosIds.includes(idM);

                        return (
                          <MercadoCarrossel
                            key={String(idM)}
                            mercadinho={m}
                            isFavorito={isFavorito}
                            onToggleFavorito={() => toggleFavorito(idM)}
                            onPress={() =>
                              navigation.navigate('DetalhesMercadinho', {
                                idMercadinho: idM,
                                mercadinho: m,
                              })
                            }
                          />
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              )}

              <View style={styles.secaoContainer}>
                <View style={styles.tituloLinha}>
                  <View>
                    <Text style={styles.tituloSecao}>Destaques da Sua Região</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.verMaisBtn}
                    onPress={() => handleNavegar('promocoes')}
                  >
                    <Text style={styles.verMais}>Ver mais</Text>
                  </TouchableOpacity>
                </View>

                {produtosExibidos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum produto em destaque na sua região.</Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -16 }}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  >
                    {produtosExibidos.slice(0, 10).map((prod) => (
                      <OfertaCard
                        key={String(prod.idProduto || prod.id)}
                        produto={prod}
                        onPress={() => {
                          const idLoja =
                            prod.idMercadinho ||
                            prod.mercadinhoId ||
                            prod.id_mercadinho ||
                            prod.mercadinho?.idMercadinho ||
                            prod.mercadinho?.id;

                          if (idLoja) {
                            navigation.navigate('DetalhesMercadinho', {
                              idMercadinho: idLoja,
                              produtoSelecionado: prod,
                            });
                          }
                        }}
                        onAdicionar={() =>
                          adicionarAoCarrinho({
                            ...prod,
                            idMercadinho:
                              prod.idMercadinho ||
                              prod.mercadinhoId ||
                              prod.id_mercadinho ||
                              prod.mercadinho?.idMercadinho ||
                              prod.mercadinho?.id,
                          })
                        }
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <BotaoCarrinho navigation={navigation} bottom={90} />
    </View>
  );
}
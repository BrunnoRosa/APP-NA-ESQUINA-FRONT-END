import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

  const { adicionarAoCarrinho } = useCarrinho();

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

      return {
        ...prod,
        idMercadinho: idFinal || null,
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
                (res.data || []).map((p) => ({
                  ...p,
                  idMercadinho: loja.idMercadinho || loja.id,
                  nomeMercadinho: loja.nomeFantasia,
                }))
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

      const intervalId = setInterval(() => {
        carregarDados();
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDados])
  );

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

  const ofertasDoDia = todosProdutos.filter((p) => {
    if (p.ativo === false) return false;
    return (
      p.emDestaque === true ||
      p.destaque === true ||
      p.oferta === true ||
      String(p.emDestaque) === 'true' ||
      p.emPromocao === true
    );
  });

  const produtosExibidos = ofertasDoDia.length > 0 ? ofertasDoDia : todosProdutos.filter(p => p.ativo !== false);

  const handleNavegar = (chave) => {
    const ts = Date.now();
    if (chave === 'mercados') {
      navigation.navigate('BuscarProdutos', { modo: 'mercados', aba: 'mercados', _ts: ts });
    } else if (chave === 'promocoes') {
      navigation.navigate('BuscarProdutos', { modo: 'promocoes', aba: 'produtos', emPromocao: true, emDestaque: true, _ts: ts });
    } else {
      navigation.navigate('BuscarProdutos', { modo: 'produtos', aba: 'produtos', _ts: ts });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
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
                    <Text style={styles.tituloSecao}>Ofertas do dia</Text>
                    <Text style={styles.subtituloSecao}>[somente em 24h]</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.verMaisBtn}
                    onPress={() => handleNavegar('promocoes')}
                  >
                    <Text style={styles.verMais}>Ver mais</Text>
                  </TouchableOpacity>
                </View>

                {produtosExibidos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum produto disponível ainda.</Text>
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
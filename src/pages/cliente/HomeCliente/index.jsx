import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CabecalhoInicio from '../../../components/CabecalhoInicio';
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

  const { adicionarAoCarrinho, totalItens } = useCarrinho();

  // Função auxiliar para montar o mapa idProduto -> idMercadinho
  const mapearLojasEProdutos = async (listaLojas, listaProdutos) => {
    const mapa = new Map();

    // 1. Tenta extrair diretamente das lojas se possuírem produtos embutidos
    for (const m of listaLojas) {
      const idLoja = m.idMercadinho || m.id;
      const prods = m.produtos || m.produtosDestaque || m.itens || [];
      for (const p of prods) {
        const idP = p.idProduto || p.id;
        if (idP && idLoja) mapa.set(Number(idP), Number(idLoja));
      }
    }

    // 2. Se o mapa estiver incompleto, busca os detalhes individuais de cada loja
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

    // 3. Aplica o idMercadinho em cada produto
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

  // Carregamento de dados com Polling preservado
  const carregarDados = useCallback(async () => {
    try {
      const [resMercadinhos, resProdutos, resFavoritos] = await Promise.all([
        api.get('/api/mercadinhos'),
        api.get('/api/produtos'),
        api.get('/api/clientes/favoritos').catch(() => ({ data: [] })),
      ]);

      const listaLojas = resMercadinhos.data || [];
      const listaProdsBrutos = resProdutos.data || [];

      const listaProdsMapeados = await mapearLojasEProdutos(listaLojas, listaProdsBrutos);

      setMercadinhos(listaLojas);
      setTodosProdutos(listaProdsMapeados);

      const ids = (resFavoritos.data || []).map((fav) => fav.idMercadinho || fav.id);
      setFavoritosIds(ids);
    } catch (error) {
      console.error('Erro ao carregar dados da Home:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling ativo a cada 3 segundos enquanto a tela estiver focada
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
      String(p.emDestaque) === 'true'
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <CabecalhoInicio
          navigation={navigation}
          quantidadeFavoritos={favoritosIds.length}
        />

        <View style={styles.folha}>
          {/* Atalhos Principais */}
          <View style={styles.atalhosLinha}>
            {ATALHOS.map((atalho) => (
              <TouchableOpacity
                key={atalho.chave}
                style={styles.atalhoItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (atalho.chave === 'mercados') {
                    navigation.navigate('BuscarProdutos', { modo: 'mercados' });
                  } else if (atalho.chave === 'promocoes') {
                    navigation.navigate('BuscarProdutos', { modo: 'promocoes' });
                  } else {
                    navigation.navigate('BuscarProdutos', { modo: 'produtos' });
                  }
                }}
              >
                <View style={styles.atalhoCirculo}>
                  <Ionicons name={atalho.icone} size={28} color={cores.primaria} />
                </View>
                <Text style={styles.atalhoNome}>{atalho.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={cores.primaria || '#007BFF'} />
            </View>
          ) : (
            <>
              {/* Carrossel Mercadinhos Próximos */}
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

              {/* Seção Ofertas do Dia */}
              <View style={styles.secaoContainer}>
                <View style={styles.tituloLinha}>
                  <View>
                    <Text style={styles.tituloSecao}>Ofertas do dia</Text>
                    <Text style={styles.subtituloSecao}>[somente em 24h]</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.verMaisBtn}
                    onPress={() => navigation.navigate('BuscarProdutos', { modo: 'promocoes' })}
                  >
                    <Text style={styles.verMais}>Ver mais</Text>
                  </TouchableOpacity>
                </View>

                {ofertasDoDia.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma oferta disponível no momento.</Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -16 }}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  >
                    {ofertasDoDia.map((prod) => (
                      <OfertaCard
                        key={String(prod.idProduto || prod.id)}
                        produto={prod}
                        onAdicionar={() =>
                          adicionarAoCarrinho({
                            ...prod,
                            idMercadinho: prod.idMercadinho,
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

      {/* Botão Flutuante do Carrinho */}
      {totalItens > 0 && (
        <TouchableOpacity
          style={styles.botaoCarrinho}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Carrinho')}
        >
          <Ionicons name="cart" size={26} color="#FFFFFF" />
          <View style={styles.badgeCarrinho}>
            <Text style={styles.badgeCarrinhoTexto}>{totalItens}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
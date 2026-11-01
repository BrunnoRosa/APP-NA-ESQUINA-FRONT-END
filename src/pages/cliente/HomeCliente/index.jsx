import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import MercadoCarrossel from '../../../components/MercadoCarrossel';
import OfertaCard from '../../../components/OfertaCard';
import { cores } from '../../../theme';
import { ordenarAbertasPrimeiro } from '../../../utils/mercado';

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CabecalhoInicio from '../../../components/CabecalhoInicio';
import BotaoCarrinho from '../../../components/BotaoCarrinho';   // 🆕
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

const ATALHOS = [
  { chave: 'promocoes', nome: 'Promoções', icone: 'pricetag' },
  { chave: 'produtos', nome: 'Produtos', icone: 'cube' },
  { chave: 'mercados', nome: 'Mercados', icone: 'storefront' },
];

export default function HomeCliente({ navigation }) {
  const [mercadinhos, setMercadinhos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState([]); // Guarda os IDs dos mercadinhos favoritados
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  const { adicionarAoCarrinho, totalItens } = useCarrinho(); // remover futuramente

  // Função centralizada para buscar os dados
  const carregarDados = useCallback(async () => {
    try {
      const [resMercadinhos, resProdutos, resFavoritos] = await Promise.all([
        api.get('/api/mercadinhos'),
        api.get('/api/produtos'),
        api.get('/api/clientes/favoritos').catch(() => ({ data: [] })), // Rota de favoritos do cliente
      ]);

      setMercadinhos(resMercadinhos.data || []);
      setTodosProdutos(resProdutos.data || []);
      
      // Mapeia apenas os IDs dos mercadinhos favoritos
      const ids = (resFavoritos.data || []).map((fav) => fav.idMercadinho || fav.id);
      setFavoritosIds(ids);
    } catch (error) {
      console.error('Erro ao carregar dados da Home:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling a cada 5 segundos enquanto a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();

      const intervalId = setInterval(() => {
        carregarDados();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDados])
  );

  // Função para favoritar ou desfavoritar um mercadinho
  const toggleFavorito = async (idMercadinho) => {
    const jaEhFavorito = favoritosIds.includes(idMercadinho);

    // Atualização otimista na interface (muda na hora sem esperar a API)
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
      // Reverte o estado caso a API falhe
      setFavoritosIds((prev) =>
        jaEhFavorito ? [...prev, idMercadinho] : prev.filter((id) => id !== idMercadinho)
      );
    }
  };

  // Filtragem dinâmica de produtos de acordo com a categoria selecionada
  const produtosExibidos = todosProdutos.filter((p) => {
    if (p.ativo === false) return false;
    if (categoriaAtiva === 'TODOS') return true;

    const nomeCategoria = typeof p.categoria === 'object'
      ? p.categoria?.nome || p.categoria?.descricao
      : p.categoria;

    return String(nomeCategoria || '').toUpperCase() === categoriaAtiva;
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Cabeçalho Amarelo com navegação para a tela de lista de Favoritos */}
        <CabecalhoInicio 
          navigation={navigation} 
          quantidadeFavoritos={favoritosIds.length} 
        />

        {/* Folha branca sobreposta */}
        <View style={styles.folha}>
          {/* Atalhos Principais */}
          <View style={styles.atalhosLinha}>
            {ATALHOS.map((atalho) => (
              <TouchableOpacity
                key={atalho.chave}
                style={styles.atalhoItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (atalho.chave === 'produtos') navigation.navigate('BuscarProdutos');
                  if (atalho.chave === 'mercados') navigation.navigate('Mercados');
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
              {/* Carrossel de Mercadinhos Próximos */}
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

              {/* Seção de Ofertas do Dia */}
              <View style={styles.secaoContainer}>
                <View style={styles.tituloLinha}>
                  <View>
                    <Text style={styles.tituloSecao}>Ofertas do dia</Text>
                    <Text style={styles.subtituloSecao}>[somente em 24h]</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.verMaisBtn}
                    onPress={() => navigation.navigate('BuscarProdutos')}
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
                        onAdicionar={() => adicionarAoCarrinho(prod)}
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
      <BotaoCarrinho navigation={navigation} bottom={90} />   {/* ✏️ */}
    </View>
  );
}
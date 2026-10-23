import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Header from '../../../components/Layout/Header';
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function BuscarProdutos({ navigation }) {
  const [termo, setTermo] = useState('');
  const [categorias, setCategorias] = useState(['TODAS']);
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODAS');
  const [ordenarPor, setOrdenarPor] = useState('preco'); // 'preco' ou 'distancia'
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Coordenadas mockadas ou obtidas por Geolocation/Contexto do Usuário
  const [userCoords, setUserCoords] = useState({ lat: -23.55052, lng: -46.633308 });

  const { adicionarAoCarrinho } = useCarrinho();

  // Carrega as categorias diretamente da API para bater com a tb_categorias do banco
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await api.get('/api/categorias');
        const nomesCategorias = response.data.map((cat) => cat.nome.toUpperCase());
        setCategorias(['TODAS', ...nomesCategorias]);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para categorias padrão
        setCategorias(['TODAS', 'BEBIDAS', 'ALIMENTOS', 'LATICÍNIOS', 'LIMPEZA', 'HIGIENE', 'PADARIA', 'HORTIFRUTI']);
      }
    }
    carregarCategorias();
  }, []);

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

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Buscar Produtos 🔍" />

      <View style={styles.content}>
        {/* Campo de Pesquisa */}
        <View style={styles.searchSection}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar açúcar, arroz, feijão..."
            placeholderTextColor="#999"
            value={termo}
            onChangeText={setTermo}
          />
          {termo.length > 0 && (
            <TouchableOpacity onPress={() => setTermo('')}>
              <Text style={{ color: '#999', fontSize: 14 }}>❌</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro por Categorias Dinâmico */}
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

        {/* Barra de Ordenação */}
        <View style={styles.sortRow}>
          <Text style={styles.resultsCount}>
            {produtos.length} resultado(s)
          </Text>
          <TouchableOpacity style={styles.sortBtn} onPress={alternarOrdenacao}>
            <Text style={styles.sortBtnText}>
              {ordenarPor === 'preco' ? '💰 Menor Preço' : '📍 Menor Distância'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Produtos Encontrados */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => String(item.idProduto || item.id || item.idProdutoBase)}
            renderItem={({ item }) => (
              <ProdutoCard
                produto={item}
                onAdicionar={() => adicionarAoCarrinho(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum produto encontrado para esta busca.
              </Text>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          />
        )}
      </View>
    </View>
  );
}
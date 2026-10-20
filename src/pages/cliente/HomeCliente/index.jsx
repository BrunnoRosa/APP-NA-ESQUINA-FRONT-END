import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Layout/Header';
import MercadinhoCard from '../../../components/MercadinhoCard';
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

const CATEGORIAS = ['TODOS', 'MERCEARIA', 'HORTIFRUTI', 'BEBIDAS', 'PADARIA', 'LIMPEZA'];

export default function HomeCliente({ navigation }) {
  const [mercadinhos, setMercadinhos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  const { adicionarAoCarrinho } = useCarrinho();

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [resMercadinhos, resProdutos] = await Promise.all([
        api.get('/api/mercadinhos'),
        api.get('/api/produtos'),
      ]);

      setMercadinhos(resMercadinhos.data || []);
      setTodosProdutos(resProdutos.data || []);
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

  // Filtragem dinâmica de produtos de acordo com a categoria selecionada
  const produtosExibidos = todosProdutos.filter((p) => {
    if (categoriaAtiva === 'TODOS') return true;
    return p.categoria?.toUpperCase() === categoriaAtiva;
  });

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Sua Região" />

      {/* AQUI FOI ADICIONADO O PADDING BOTTOM PARA A ROLAGEM */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
              Compre do Bairro 🛍️
            </Text>
            <Text style={{ color: '#E3F2FD', fontSize: 12, marginTop: 2 }}>
              Entrega rápida e produtos fresquinhos do mercadinho mais próximo.
            </Text>
          </View>
          <Text style={{ fontSize: 36 }}>🛒</Text>
        </View>

        {/* Filtro de Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {CATEGORIAS.map((cat) => (
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <>
            {/* Lista de Mercadinhos */}
            {categoriaAtiva === 'TODOS' && (
              <>
                <Text style={styles.sectionTitle}>Mercadinhos da Região 🏪</Text>
                {mercadinhos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum mercadinho cadastrado ainda.</Text>
                ) : (
                  mercadinhos.map((m) => (
                    <MercadinhoCard
                      key={String(m.idMercadinho || m.id)}
                      mercadinho={m}
                      onPress={() =>
                        navigation.navigate('DetalhesMercadinho', {
                          idMercadinho: m.idMercadinho || m.id,
                          mercadinho: m,
                        })
                      }
                    />
                  ))
                )}
              </>
            )}

            {/* Lista de Produtos Filtrados */}
            <Text style={styles.sectionTitle}>
              {categoriaAtiva === 'TODOS' ? 'Ofertas na Esquina ⭐' : `Produtos em ${categoriaAtiva}`}
            </Text>

            {produtosExibidos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto encontrado nesta categoria.</Text>
            ) : (
              produtosExibidos.map((prod) => (
                <ProdutoCard
                  key={String(prod.idProduto || prod.id)}
                  produto={prod}
                  onAdicionar={() => adicionarAoCarrinho(prod)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
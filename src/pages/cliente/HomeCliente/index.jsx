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

  // Função centralizada para buscar os dados
  const carregarDados = useCallback(async () => {
    try {
      // Removemos o setLoading(true) daqui para que a tela não "pisque" a cada 5 segundos no polling.
      // Se quiser mostrar o loading apenas na primeira vez, pode gerenciar isso com outro estado.
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

  // Polling a cada 5 segundos enquanto a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      // 1. Chama imediatamente assim que a tela ganha foco
      carregarDados();

      // 2. Configura o intervalo para rodar a cada 5 segundos
      const intervalId = setInterval(() => {
        carregarDados();
      }, 5000);

      // 3. Função de limpeza: para o intervalo quando a tela perde o foco
      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDados])
  );

  // Filtragem dinâmica de produtos de acordo com a categoria selecionada
  const produtosExibidos = todosProdutos.filter((p) => {
    // Se o produto não estiver ativo, ele não deve ser exibido (ajuste a propriedade 'ativo' conforme o seu backend)
    if (p.ativo === false) return false; 
    
    if (categoriaAtiva === 'TODOS') return true;
    return p.categoria?.toUpperCase() === categoriaAtiva;
  });

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Sua Região" />

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
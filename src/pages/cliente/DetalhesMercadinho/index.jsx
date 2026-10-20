import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from '../../../components/Layout/Header';
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function DetalhesMercadinho({ route, navigation }) {
  const { idMercadinho, mercadinho: mercadinhoParam } = route.params || {};

  const [mercadinho, setMercadinho] = useState(mercadinhoParam || null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { adicionarAoCarrinho } = useCarrinho();

  const carregarDadosMercadinho = useCallback(async () => {
    try {
      setLoading(true);
      const id = idMercadinho || 1;

      if (!mercadinhoParam) {
        const resMercadinho = await api.get(`/api/mercadinhos/${id}`);
        setMercadinho(resMercadinho.data);
      }

      const resProdutos = await api.get(`/api/produtos/mercadinho/${id}`);
      setProdutos(resProdutos.data || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do mercadinho:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinho, mercadinhoParam]);

  useEffect(() => {
    carregarDadosMercadinho();
  }, [carregarDadosMercadinho]);

  const destaques = produtos.filter((p) => p.emDestaque);

  return (
    <View style={styles.wrapper}>
      <Header navigation={navigation} title={mercadinho?.nomeFantasia || 'Mercadinho'} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.btnVoltarText}>← Voltar para lojas</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.nomeLoja}>
            🏪 {mercadinho?.nomeFantasia || 'Mercadinho Local'}
          </Text>
          <Text style={styles.enderecoLoja}>
            📍 {mercadinho?.endereco || 'Bairro local'}
          </Text>
          <View style={styles.badgeStatus}>
            <Text style={styles.badgeText}>🟢 Aberto Agora</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 30 }} />
        ) : (
          <>
            {destaques.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Destaques da Loja ⭐</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {destaques.map((item) => (
                    <View key={String(item.idProduto || item.id)} style={{ width: 260, marginRight: 12 }}>
                      <ProdutoCard
                        produto={item}
                        onAdicionar={() => adicionarAoCarrinho(item)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.sectionTitle}>Todos os Produtos ({produtos.length})</Text>
            {produtos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto cadastrado nesta loja.</Text>
            ) : (
              produtos.map((item) => (
                <ProdutoCard
                  key={String(item.idProduto || item.id)}
                  produto={item}
                  onAdicionar={() => adicionarAoCarrinho(item)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
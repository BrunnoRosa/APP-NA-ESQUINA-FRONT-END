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
      // O setLoading(true) foi removido para evitar que a tela pisque a cada 5 segundos
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

  // Executa o Polling a cada 5 segundos enquanto a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      // 1. Chama imediatamente ao entrar na tela
      carregarDadosMercadinho();

      // 2. Configura a atualização automática (5 em 5 segundos)
      const intervalId = setInterval(() => {
        carregarDadosMercadinho();
      }, 5000);

      // 3. Limpa o intervalo ao sair da tela
      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDadosMercadinho])
  );

  // Filtra apenas produtos ativos. Se a sua API já traz apenas ativos, isso serve de garantia extra.
  const produtosAtivos = produtos.filter((p) => p.ativo !== false);
  const destaques = produtosAtivos.filter((p) => p.emDestaque);

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
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginBottom: 16 }}>
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

            <Text style={styles.sectionTitle}>Todos os Produtos ({produtosAtivos.length})</Text>
            {produtosAtivos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto cadastrado nesta loja.</Text>
            ) : (
              produtosAtivos.map((item) => (
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
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function GerenciarVitrine({ navigation }) {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alterandoId, setAlterandoId] = useState(null);

  const idMercadinho = user?.idMercadinho || user?.id || 1;

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}?t=${new Date().getTime()}`);
      setProdutos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos para vitrine:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinho]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const alternarDestaque = async (produto) => {
    setAlterandoId(produto.idProduto);
    const novoStatus = !produto.emDestaque;

    try {
      await api.put(`/api/produtos/${produto.idProduto}/destaque?emDestaque=${novoStatus}`);
      exibirAlerta(
        'Vitrine Atualizada ⭐',
        `O produto "${produto.nome}" foi ${novoStatus ? 'adicionado aos' : 'removido dos'} destaques.`
      );
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao alternar destaque:', error);
      exibirAlerta('Erro', 'Não foi possível alterar a visibilidade do destaque.');
    } finally {
      setAlterandoId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ofertas & Destaques ⭐</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>💡 Como funcionam os Destaques?</Text>
          <Text style={styles.infoBannerText}>
            Produtos marcados com a estrela ganham prioridade nas buscas e aparecem no topo da tela principal dos clientes do seu bairro.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 40 }} />
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => String(item.idProduto)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isBusy = alterandoId === item.idProduto;
              const preco = Number(item.preco || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });

              return (
                <View style={styles.cardItem}>
                  <View style={styles.cardLeft}>
                    <View style={styles.emojiBox}>
                      <Text style={{ fontSize: 22 }}>📦</Text>
                    </View>
                    <View>
                      <Text style={styles.nomeProduto}>{item.nome}</Text>
                      <Text style={styles.precoProduto}>{preco}</Text>
                    </View>
                  </View>

                  {isBusy ? (
                    <ActivityIndicator size="small" color="#007BFF" />
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.btnDestaque,
                        item.emDestaque ? styles.btnDestaqueAtivo : styles.btnDestaqueInativo,
                      ]}
                      onPress={() => alternarDestaque(item)}
                    >
                      <Text
                        style={
                          item.emDestaque
                            ? styles.btnDestaqueTextAtivo
                            : styles.btnDestaqueTextInativo
                        }
                      >
                        {item.emDestaque ? '⭐ Em Destaque' : '＋ Destacar'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
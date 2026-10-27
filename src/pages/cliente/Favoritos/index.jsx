import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MercadoCarrossel from '../../../components/MercadoCarrossel';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { styles } from './styles';

export default function Favoritos({ navigation }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega a lista de favoritos do backend ao focar na tela
  const carregarFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/clientes/favoritos');
      setFavoritos(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [carregarFavoritos])
  );

  // Remove um mercadinho da lista com atualização otimista
  const removerFavorito = async (idMercadinho) => {
    setFavoritos((prev) =>
      prev.filter((m) => (m.idMercadinho || m.id) !== idMercadinho)
    );

    try {
      await api.delete(`/api/clientes/favoritos/${idMercadinho}`);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      carregarFavoritos();
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={cores.textoTitulo || '#212529'} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Meus Favoritos</Text>
        <View style={styles.espacador} />
      </View>

      {/* Conteúdo Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.primaria || '#E52421'} />
        </View>
      ) : favoritos.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color="#CCCCCC" />
          <Text style={styles.vazioTexto}>Você ainda não possui mercadinhos favoritados.</Text>
          <TouchableOpacity
            style={styles.btnExplorar}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnExplorarTexto}>Explorar Mercadinhos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => String(item.idMercadinho || item.id)}
          numColumns={2}
          contentContainerStyle={styles.listaContainer}
          columnWrapperStyle={styles.colunaWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const idM = item.idMercadinho || item.id;
            return (
              <MercadoCarrossel
                mercadinho={item}
                isFavorito={true}
                onToggleFavorito={() => removerFavorito(idM)}
                onPress={() =>
                  navigation.navigate('DetalhesMercadinho', {
                    idMercadinho: idM,
                    mercadinho: item,
                  })
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}
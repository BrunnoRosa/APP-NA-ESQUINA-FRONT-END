import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';          // 🆕
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,                                                         // 🆕
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { estaAberto, formatarHora } from '../../../utils/mercado'; // 🆕
import { styles } from './styles';
// 🗑️ removido: import MercadoCarrossel (o cartão agora é desta tela)

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

  // 🆕 Cartão de uma loja favorita (linha inteira)
  function renderFavorito({ item }) {
    const idM = item.idMercadinho || item.id;
    const nome = item.nomeFantasia || item.nome || 'Mercadinho';
    const endereco = item.endereco || 'Endereço não informado';
    const aberto = Boolean(estaAberto(item.horarioAbertura, item.horarioFechamento));
    const fecha = formatarHora(item.horarioFechamento);
    const textoSelo = aberto ? (fecha ? `Aberto até às ${fecha}` : 'Aberto') : 'Fechado';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('DetalhesMercadinho', {
            idMercadinho: idM,
            mercadinho: item,
          })
        }
      >
        <View style={styles.foto}>
          {item.imagemUrl ? (
            <Image source={{ uri: item.imagemUrl }} style={styles.imagem} resizeMode="cover" />
          ) : (
            <Ionicons name="storefront" size={30} color={cores.icone} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>{String(nome)}</Text>

          <View style={styles.linhaEndereco}>
            <Ionicons name="location-outline" size={13} color={cores.textoSecundario} />
            <Text style={styles.endereco} numberOfLines={1}>{String(endereco)}</Text>
          </View>

          <View style={[styles.selo, { backgroundColor: aberto ? cores.sucesso : '#9E9E9E' }]}>
            <Text style={styles.seloTexto}>{textoSelo}</Text>
          </View>
        </View>

        {/* Coração: toque remove dos favoritos */}
        <TouchableOpacity
          style={styles.botaoCoracao}
          onPress={() => removerFavorito(idM)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart" size={22} color={cores.primaria} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
          </TouchableOpacity>

          <View>
            <Text style={styles.titulo}>Meus favoritos</Text>
            {!loading && favoritos.length > 0 && (
              <Text style={styles.subtitulo}>
                {favoritos.length} {favoritos.length === 1 ? 'mercado' : 'mercados'}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        {loading ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : favoritos.length === 0 ? (
          <View style={styles.centro}>
            <View style={styles.vazioCirculo}>
              <Ionicons name="heart-outline" size={44} color={cores.primaria} />
            </View>
            <Text style={styles.vazioTitulo}>Nenhum favorito ainda</Text>
            <Text style={styles.vazioTexto}>
              Toque no coração de um mercado para encontrá-lo aqui.
            </Text>
            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={() => navigation.navigate('ClienteTabs', { screen: 'HomeCliente' })}  // ✏️ rota corrigida
              activeOpacity={0.85}
            >
              <Text style={styles.botaoPrimarioTexto}>Explorar mercados</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favoritos}
            keyExtractor={(item) => String(item.idMercadinho || item.id)}
            renderItem={renderFavorito}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
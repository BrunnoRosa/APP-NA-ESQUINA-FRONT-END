import { Ionicons } from '@expo/vector-icons'; // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🆕
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕
import { traduzirErro } from '../../../utils/validacoes';
import { styles } from './styles';

export default function GerenciarVitrine({ navigation }) {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alterandoId, setAlterandoId] = useState(null);

  // ✏️ Sem fallback para a loja 1: usa só o mercadinho real do comerciante
  const idMercadinho = user?.idMercadinho;

    // Toast central (em vez do alert do navegador). Mesmo formato: exibirAlerta(titulo, mensagem)
  const { exibirAlerta } = useToast();

  const carregarProdutos = useCallback(async () => {
    if (!idMercadinho) {
      setLoading(false);
      return;
    }

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
        'Vitrine Atualizada',
        `O produto "${produto.nome}" foi ${novoStatus ? 'adicionado aos' : 'removido dos'} destaques.`
      );
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao alternar destaque:', error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setAlterandoId(null);
    }
  };

  // 🆕 Quantos produtos estão em destaque (para o subtítulo)
  const totalDestaques = produtos.filter((p) => p.emDestaque).length;

  // 🆕 Bloco de explicação, acima da lista
  const cabecalhoLista = (
    <View style={styles.banner}>
      <View style={styles.bannerIcone}>
        <Ionicons name="bulb-outline" size={22} color={cores.primaria} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitulo}>Como funcionam os destaques?</Text>
        <Text style={styles.bannerTexto}>
          Produtos marcados com a estrela ganham prioridade nas buscas e aparecem no topo da tela principal dos clientes do seu bairro.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê (aba: sem botão voltar) */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <Text style={styles.titulo}>Ofertas e destaques</Text>
        {!loading && produtos.length > 0 && (
          <Text style={styles.subtitulo}>
            {totalDestaques} de {produtos.length} em destaque
          </Text>
        )}
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        <FlatList
          data={loading ? [] : produtos}
          keyExtractor={(item) => String(item.idProduto)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={cabecalhoLista}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 30 }} />
            ) : (
              <Text style={styles.vazioTexto}>
                {idMercadinho
                  ? 'Nenhum produto cadastrado ainda.'
                  : 'Mercadinho não identificado. Saia da conta e entre novamente.'}
              </Text>
            )
          }
          renderItem={({ item }) => {
            const isBusy = alterandoId === item.idProduto;
            const preco = Number(item.preco || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            });

            return (
              <View style={styles.cardItem}>
                <View style={styles.foto}>
                  {item.imagemUrl ? (
                    <Image source={{ uri: item.imagemUrl }} style={styles.imagem} resizeMode="contain" />
                  ) : (
                    <Ionicons name="cube" size={24} color={cores.icone} />
                  )}
                </View>

                <View style={styles.info}>
                  <Text style={styles.nomeProduto} numberOfLines={2}>{item.nome}</Text>
                  <Text style={styles.precoProduto}>{preco}</Text>
                </View>

                {isBusy ? (
                  <ActivityIndicator size="small" color={cores.primaria} />
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.btnDestaque,
                      item.emDestaque ? styles.btnDestaqueAtivo : styles.btnDestaqueInativo,
                    ]}
                    onPress={() => alternarDestaque(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={item.emDestaque ? 'star' : 'star-outline'}
                      size={15}
                      color={item.emDestaque ? '#FFFFFF' : cores.primaria}
                    />
                    <Text style={item.emDestaque ? styles.btnTextoAtivo : styles.btnTextoInativo}>
                      {item.emDestaque ? 'Destaque' : 'Destacar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
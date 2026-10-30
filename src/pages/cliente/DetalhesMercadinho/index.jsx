import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../../../components/Layout/Header';
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { estaAberto, formatarHora } from '../../../utils/mercado';
import { styles } from './styles';

export default function DetalhesMercadinho({ route, navigation }) {
  const { idMercadinho, mercadinho: mercadinhoParam } = route.params || {};

  const [mercadinho, setMercadinho] = useState(mercadinhoParam || null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { adicionarAoCarrinho } = useCarrinho();

  // Consolida a identificação do ID do Mercadinho da página atual
  const idMercadinhoAtual =
    idMercadinho ||
    mercadinhoParam?.id ||
    mercadinhoParam?.idMercadinho ||
    mercadinho?.id ||
    mercadinho?.idMercadinho;

  const handleAdicionarProduto = (item) => {
    // Garante a injeção explícita tanto no objeto quanto como parâmetro direto
    const produtoComMercadinho = {
      ...item,
      idMercadinho: idMercadinhoAtual || item?.idMercadinho || item?.mercadinhoId,
    };
    
    adicionarAoCarrinho(produtoComMercadinho, idMercadinhoAtual);
  };

  const carregarDadosMercadinho = useCallback(async () => {
    try {
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

  useFocusEffect(
    useCallback(() => {
      carregarDadosMercadinho();

      const intervalId = setInterval(() => {
        carregarDadosMercadinho();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }, [carregarDadosMercadinho])
  );

  const produtosAtivos = produtos.filter((p) => p.ativo !== false);
  const destaques = produtosAtivos.filter((p) => p.emDestaque);

  const aberto = estaAberto(mercadinho?.horarioAbertura, mercadinho?.horarioFechamento);
  const fecha = formatarHora(mercadinho?.horarioFechamento);

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
          
          <View style={[styles.badgeStatus, !aberto && { backgroundColor: '#E5E5E5' }]}>
            <Text style={styles.badgeText}>
              {aberto
                ? `🟢 Aberto${fecha ? ` até às ${fecha}` : ' agora'}`
                : '⚪ Fechado agora'}
            </Text>
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
                        onAdicionar={handleAdicionarProduto}
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
                  onAdicionar={handleAdicionarProduto}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
import { Ionicons } from '@expo/vector-icons';                  // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';          // 🆕
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BotaoCarrinho from '../../../components/BotaoCarrinho';  // 🆕
import OfertaCard from '../../../components/OfertaCard';        // 🆕
import ProdutoCard from '../../../components/ProdutoCard';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { cores } from '../../../theme';                         // 🆕
import { estaAberto, formatarHora } from '../../../utils/mercado';
import { styles } from './styles';
// 🗑️ removido: import Header from '../../../components/Layout/Header';

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

  const aberto = Boolean(
    estaAberto(mercadinho?.horarioAbertura, mercadinho?.horarioFechamento)
  );
  const abre = formatarHora(mercadinho?.horarioAbertura);       // 🆕
  const fecha = formatarHora(mercadinho?.horarioFechamento);

  // ✏️ Visual novo a partir daqui
  return (
    <View style={styles.wrapper}>
      {/* 🆕 Topo com degradê, voltar e dados da loja */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
        </TouchableOpacity>

        <Text style={styles.nomeLoja} numberOfLines={2}>
          {mercadinho?.nomeFantasia || 'Mercadinho Local'}
        </Text>

        <View style={styles.enderecoLinha}>
          <Ionicons name="location-outline" size={15} color={cores.textoEndereco} />
          <Text style={styles.enderecoLoja} numberOfLines={2}>
            {mercadinho?.endereco || 'Endereço não informado'}
          </Text>
        </View>
      </LinearGradient>

      {/* 🆕 Folha branca com o conteúdo rolável */}
      <View style={styles.folha}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selo Aberto/Fechado + horário */}
          <View style={styles.statusLinha}>
            <View
              style={[
                styles.seloStatus,
                { backgroundColor: aberto ? cores.sucesso : '#9E9E9E' },
              ]}
            >
              <Text style={styles.seloTexto}>
                {aberto ? 'Aberto' : 'Fechado'}
              </Text>
            </View>

            {abre && fecha ? (
              <Text style={styles.funcionamento}>
                Funcionamento: {abre} às {fecha}
              </Text>
            ) : null}
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={cores.primaria}
              style={{ marginVertical: 30 }}
            />
          ) : (
            <>
              {destaques.length > 0 && (
                <>
                  <Text style={styles.secaoTitulo}>Destaques da loja</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.carrossel}
                  >
                    {destaques.map((item) => (
                      <OfertaCard
                        key={String(item.idProduto || item.id)}
                        produto={item}
                        onAdicionar={() => handleAdicionarProduto(item)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}

              <Text style={styles.secaoTitulo}>
                Todos os produtos ({produtosAtivos.length})
              </Text>
              {produtosAtivos.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum produto cadastrado nesta loja.
                </Text>
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

      {/* 🆕 Botão flutuante do carrinho */}
      <BotaoCarrinho navigation={navigation} bottom={30} />
    </View>
  );
}
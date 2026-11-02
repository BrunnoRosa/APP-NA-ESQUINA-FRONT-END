import { Ionicons } from '@expo/vector-icons'; // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🆕
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕
import { styles } from './styles';
// 🗑️ removido: import Header (o topo agora é o degradê desta tela)

// 🆕 Atalhos da tela: a lista evita repetir 3 blocos quase iguais
const ACOES = [
  {
    rota: 'GerenciarProdutos',
    icone: 'cube-outline',
    titulo: 'Gerir catálogo de produtos',
    descricao: 'Cadastre novos itens, altere preços e ajuste o inventário.',
  },
  {
    rota: 'GerenciarVitrine',
    icone: 'star-outline',
    titulo: 'Gerir ofertas e destaques',
    descricao: 'Escolha os produtos que aparecem em destaque para os clientes.',
  },
  {
    rota: 'GerenciarPedidos',
    icone: 'receipt-outline',
    titulo: 'Gerenciar pedidos recebidos',
    descricao: 'Veja os pedidos dos clientes, aceite compras e altere os status.',
  },
];

export default function DashboardComerciante({ navigation }) {
  const { user, signOut } = useAuth();
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalDestaques, setTotalDestaques] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nomeMercado, setNomeMercado] = useState('');          // 🆕

  // ✏️ Sem fallback para a loja 1: usa só o mercadinho real do comerciante
  const idMercadinho = user?.idMercadinho;

  const carregarMetricas = useCallback(async () => {
    if (!idMercadinho) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}`);
      const prods = response.data || [];
      setTotalProdutos(prods.length);
      setTotalDestaques(prods.filter((p) => p.emDestaque).length);
            // 🆕 Busca o nome da loja (falha aqui não deve derrubar as métricas)
      try {
        const resLojas = await api.get('/api/mercadinhos');
        const lojas = Array.isArray(resLojas.data)
          ? resLojas.data
          : (resLojas.data?.content || []);
        const minha = lojas.find(
          (m) => Number(m.idMercadinho || m.id) === Number(idMercadinho)
        );
        setNomeMercado(minha?.nomeFantasia || '');
      } catch (e) {
        console.warn('Não foi possível carregar o nome da loja:', e);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinho]);

  useFocusEffect(
    useCallback(() => {
      carregarMetricas();
    }, [carregarMetricas])
  );

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <View style={{ flex: 1 }}>
            <Text style={styles.saudacao}>Painel do comerciante</Text>
            <Text style={styles.nome} numberOfLines={1}>
              {nomeMercado || user?.nome || user?.email || 'Minha loja'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botaoSair, { marginRight: 8 }]}
            onPress={() => navigation.navigate('EditarPerfil')}
            activeOpacity={0.8}
            accessibilityLabel="Editar perfil"
          >
            <Ionicons name="create-outline" size={22} color={cores.primaria} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSair}
            onPress={signOut}
            activeOpacity={0.8}
            accessibilityLabel="Sair da conta"
          >
            <Ionicons name="log-out-outline" size={22} color={cores.primaria} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
        >
          {!idMercadinho ? (
            <View style={styles.aviso}>
              <Ionicons name="alert-circle-outline" size={22} color={cores.primaria} />
              <Text style={styles.avisoTexto}>
                Não foi possível identificar o seu mercadinho. Saia da conta e entre novamente.
              </Text>
            </View>
          ) : null}

          <Text style={styles.secaoTitulo}>Visão geral</Text>

          {loading ? (
            <ActivityIndicator size="large" color={cores.primaria} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.metricasLinha}>
              <View style={styles.metricaCard}>
                <Text style={styles.metricaValor}>{totalProdutos}</Text>
                <Text style={styles.metricaRotulo}>Produtos no catálogo</Text>
              </View>

              <View style={styles.metricaCard}>
                <View style={styles.metricaValorLinha}>
                  <Text style={styles.metricaValor}>{totalDestaques}</Text>
                  <Ionicons name="star" size={18} color={cores.laranjaDistancia} />
                </View>
                <Text style={styles.metricaRotulo}>Em destaque</Text>
              </View>
            </View>
          )}

          <Text style={[styles.secaoTitulo, { marginTop: 8 }]}>Ações rápidas</Text>

          {ACOES.map((acao) => (
            <TouchableOpacity
              key={acao.rota}
              style={styles.acaoCard}
              onPress={() => navigation.navigate(acao.rota)}
              activeOpacity={0.8}
            >
              <View style={styles.acaoIcone}>
                <Ionicons name={acao.icone} size={24} color={cores.primaria} />
              </View>

              <View style={styles.acaoTextos}>
                <Text style={styles.acaoTitulo}>{acao.titulo}</Text>
                <Text style={styles.acaoDescricao}>{acao.descricao}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={cores.textoInativo} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
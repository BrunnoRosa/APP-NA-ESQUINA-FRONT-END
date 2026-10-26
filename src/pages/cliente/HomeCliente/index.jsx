import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import MercadoCarrossel from '../../../components/MercadoCarrossel';
import OfertaCard from '../../../components/OfertaCard';
import { cores } from '../../../theme';
import { ordenarAbertasPrimeiro } from '../../../utils/mercado';

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CabecalhoInicio from '../../../components/CabecalhoInicio';
import { useCarrinho } from '../../../context/CarrinhoContext';
import api from '../../../services/api';
import { styles } from './styles';

const CATEGORIAS = [
  { chave: 'HORTIFRUTI', nome: 'Hortifruti', emoji: '🍌' },
  { chave: 'PADARIA', nome: 'Padaria', emoji: '🥖' },
  { chave: 'LIMPEZA', nome: 'Limpeza', emoji: '🧴' },
  { chave: 'BEBIDAS', nome: 'Bebidas', emoji: '🥤' },
  { chave: 'ALIMENTOS', nome: 'Alimentos', emoji: '🍚' },
  { chave: 'HIGIENE', nome: 'Higiene', emoji: '🧼' },
  { chave: 'OUTROS', nome: 'Outros', emoji: '📦' },
];

const ATALHOS = [
  { chave: 'promocoes', nome: 'Promoções', icone: 'pricetag' },
  { chave: 'produtos', nome: 'Produtos', icone: 'cube' },
  { chave: 'mercados', nome: 'Mercados', icone: 'storefront' },
];

export default function HomeCliente({ navigation }) {
  const [mercadinhos, setMercadinhos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('TODOS');
  const [loading, setLoading] = useState(true);

  const { adicionarAoCarrinho, totalItens } = useCarrinho();

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
    // Se o produto não estiver ativo, ele não deve ser exibido
    if (p.ativo === false) return false;

    if (categoriaAtiva === 'TODOS') return true;

    // Extrai o nome da categoria seja ela uma String ou um Objeto
    const nomeCategoria = typeof p.categoria === 'object'
      ? p.categoria?.nome || p.categoria?.descricao
      : p.categoria;

    // Converte para String antes de chamar toUpperCase()
    return String(nomeCategoria || '').toUpperCase() === categoriaAtiva;
  });

  return (
    <View style={styles.container}>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
      {/* Cabeçalho amarelo: margens negativas "cancelam" o padding de 16 da rolagem */}
      <View style={{ marginHorizontal: -16, marginTop: -16 }}>
        <CabecalhoInicio navigation={navigation} />
      </View>

      {/* Folha branca com os atalhos */}
      <View style={styles.folha}>
        <View style={styles.atalhosLinha}>
          {ATALHOS.map((atalho) => (
            <TouchableOpacity
              key={atalho.chave}
              style={styles.atalhoItem}
              activeOpacity={0.7}
              onPress={() => {
                if (atalho.chave === 'produtos') navigation.navigate('BuscarProdutos');
              }}
            >
              <View style={styles.atalhoCirculo}>
                <Ionicons name={atalho.icone} size={30} color={cores.primaria} />
              </View>
              <Text style={styles.atalhoNome}>{atalho.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        ) : (
          <>
            {/* Lista de Mercadinhos próximos (carrossel) */}
            {categoriaAtiva === 'TODOS' && (
              <>
                <Text style={styles.sectionTitle}>Mercadinhos próximos de você</Text>
                {mercadinhos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum mercadinho cadastrado ainda.</Text>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -16 }}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  >
                    {ordenarAbertasPrimeiro(mercadinhos).map((m) => ( // ALTERADO: abertas primeiro
                      <MercadoCarrossel
                        key={String(m.idMercadinho || m.id)}
                        mercadinho={m}
                        onPress={() =>
                          navigation.navigate('DetalhesMercadinho', {
                            idMercadinho: m.idMercadinho || m.id,
                            mercadinho: m,
                          })
                        }
                      />
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/* Lista de Produtos Filtrados */}
            {/* Ofertas do dia */}
            <View style={styles.tituloLinha}>
              <Text style={styles.tituloSecao}>Ofertas do dia</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BuscarProdutos')}>
                <Text style={styles.verMais}>Ver mais</Text>
              </TouchableOpacity>
            </View>

            {produtosExibidos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto disponível ainda.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -16 }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {produtosExibidos.slice(0, 10).map((prod) => (
                  <OfertaCard
                    key={String(prod.idProduto || prod.id)}
                    produto={prod}
                    onAdicionar={() => adicionarAoCarrinho(prod)}
                  />
                ))}
              </ScrollView>
            )}
          </>
        )}
      </ScrollView>
      {/* Botão flutuante do carrinho: só aparece com itens */}
      {totalItens > 0 && (
        <TouchableOpacity
          style={styles.botaoCarrinho}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Carrinho')}
        >
          <Ionicons name="cart" size={26} color="#FFFFFF" />
          <View style={styles.badgeCarrinho}>
            <Text style={styles.badgeCarrinhoTexto}>{totalItens}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
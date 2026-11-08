import { Ionicons } from '@expo/vector-icons'; // 🆕
import { LinearGradient } from 'expo-linear-gradient'; // 🆕
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕
import { validarPreco } from '../../../utils/validacoes';
import { styles } from './styles';

export default function AtivarProdutoCatalogo({ navigation, route }) {
  const { user } = useAuth();

  // ✏️ Usa só o mercadinho real (rota ou login). Antes caía no id do usuário.
  const idMercadinho = route?.params?.idMercadinho || user?.idMercadinho || user?.mercadinho?.idMercadinho;

  const [termo, setTermo] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [idsAtivados, setIdsAtivados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);

    // Toast central (em vez do alert do navegador). Mesmo formato: exibirAlerta(titulo, mensagem)
  const { exibirAlerta } = useToast();

  const carregarProdutosJaAtivados = useCallback(async () => {
    if (!idMercadinho) return;

    try {
      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}`);
      const ids = (response.data || [])
        .map((p) => p.produtoBase?.idProdutoBase)
        .filter(Boolean);
      setIdsAtivados(ids);
    } catch (error) {
      console.error('Erro ao buscar produtos já ativados:', error);
    }
  }, [idMercadinho]);

  const buscarCatalogo = useCallback(async () => {
    try {
      setLoading(true);
      await carregarProdutosJaAtivados();

      const endpoint = termo.trim()
        ? `/api/catalogo-global/buscar?nome=${encodeURIComponent(termo)}`
        : '/api/catalogo-global';

      const response = await api.get(endpoint);
      setCatalogo(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar catálogo global:', error);
      exibirAlerta('Erro', 'Não foi possível carregar os produtos do catálogo.');
    } finally {
      setLoading(false);
    }
  }, [termo, carregarProdutosJaAtivados]);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarCatalogo();
    }, 300);
    return () => clearTimeout(timer);
  }, [termo, buscarCatalogo]);

  const abrirModalAtivacao = (item) => {
    setProdutoSelecionado(item);
    setPreco('');
    setModalVisivel(true);
  };

  const confirmarAtivacao = async () => {
    const precoNumerico = parseFloat(preco.replace(',', '.'));

    const erroPreco = validarPreco(preco);
    if (erroPreco) {
      exibirAlerta('Atenção', erroPreco, 'aviso');
      return;
    }

    if (!idMercadinho) {
      exibirAlerta('Erro', 'Mercadinho não identificado.');
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        idMercadinho: Number(idMercadinho),
        idProdutoBase: produtoSelecionado.idProdutoBase,
        preco: precoNumerico,
        ativo: true,
      };

      await api.post('/api/produtos/ativar-do-catalogo', payload);

      // 1. Atualiza a lista local de ativados
      setIdsAtivados((prev) => [...prev, produtoSelecionado.idProdutoBase]);

      // 2. Armazena o nome e fecha o modal
      const nomeProdutoAtivado = produtoSelecionado.nome;
      setModalVisivel(false);
      setProdutoSelecionado(null);

      // 3. Exibe o alerta com pequeno delay para liberar a renderização da Web
      setTimeout(() => {
        exibirAlerta(
          'Sucesso! 🎉',
          `"${nomeProdutoAtivado}" foi adicionado ao seu estoque por R$ ${precoNumerico.toFixed(2)}.`
        );
      }, 100);

    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      const erro = traduzirErro(error);

      setModalVisivel(false);
      setTimeout(() => {
        exibirAlerta(erro.titulo, erro.mensagem);
      }, 100);
    } finally {
      setSalvando(false);
    }
  };

  // ✏️ Visual novo a partir daqui
  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê: voltar, título e busca */}
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
          <Text style={styles.titulo}>Adicionar ao estoque</Text>
        </View>

        <View style={styles.busca}>
          <Ionicons name="search" size={18} color={cores.icone} />
          <TextInput
            style={styles.buscaInput}
            placeholder="Pesquisar Coca, Arroz, Detergente..."
            placeholderTextColor={cores.icone}
            value={termo}
            onChangeText={setTermo}
          />
          {termo.length > 0 && (
            <TouchableOpacity onPress={() => setTermo('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={cores.icone} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={styles.folha}>
        {loading ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : (
          <FlatList
            data={catalogo}
            keyExtractor={(item) => String(item.idProdutoBase)}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const jaAtivado = idsAtivados.includes(item.idProdutoBase);

              return (
                <View style={[styles.cardItem, jaAtivado && styles.cardAtivado]}>
                  <View style={styles.foto}>
                    {item.imagemUrl ? (
                      <Image source={{ uri: item.imagemUrl }} style={styles.imagem} resizeMode="contain" />
                    ) : (
                      <Ionicons name="cube" size={24} color={cores.icone} />
                    )}
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.nomeItem} numberOfLines={2}>
                      {item.nome}
                    </Text>
                    <Text style={styles.subtextItem} numberOfLines={1}>
                      {item.categoria?.nome || 'Geral'} • EAN {item.codigoBarra || 'sem código'}
                    </Text>
                  </View>

                  {jaAtivado ? (
                    <View style={styles.seloAtivado}>
                      <Ionicons name="checkmark" size={14} color={cores.textoSecundario} />
                      <Text style={styles.seloAtivadoTexto}>Ativado</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnAtivar}
                      onPress={() => abrirModalAtivacao(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.btnAtivarTexto}>Ativar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.vazioTexto}>
                Nenhum produto encontrado no catálogo global.
              </Text>
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Ativar no estoque</Text>
            <Text style={styles.modalSubtitulo} numberOfLines={2}>
              {produtoSelecionado?.nome}
            </Text>

            <Text style={styles.rotulo}>Preço de venda (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={cores.icone}
              keyboardType="numeric"
              value={preco}
              onChangeText={setPreco}
              autoFocus
            />

            <View style={styles.modalAcoes}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnContorno]}
                onPress={() => setModalVisivel(false)}
                disabled={salvando}
                activeOpacity={0.85}
              >
                <Text style={styles.btnContornoTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModal, styles.btnPrimario]}
                onPress={confirmarAtivacao}
                disabled={salvando}
                activeOpacity={0.85}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnPrimarioTexto}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
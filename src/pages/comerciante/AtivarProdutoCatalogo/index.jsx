import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import api from '../../../services/api';
import { styles } from './styles';
import { useAuth } from '../../../context/AuthContext';

export default function AtivarProdutoCatalogo({ navigation, route }) {
  const { user } = useAuth();
  
  // Pega dinamicamente o ID do mercadinho logado ou da rota
  const idMercadinho = user?.idMercadinho || user?.mercadinho?.idMercadinho || user?.idUsuario || user?.id || route?.params?.idMercadinho;

  const [termo, setTermo] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [idsAtivados, setIdsAtivados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

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

    if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
      exibirAlerta('Atenção', 'Informe um preço válido maior que zero.');
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
      const mensagem = error.response?.data?.message || 'Erro ao ativar produto no estoque.';

      setModalVisivel(false);
      setTimeout(() => {
        exibirAlerta('Erro', mensagem);
      }, 100);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 16, color: '#007BFF', fontWeight: 'bold' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#212529' }}>Adicionar ao Estoque 📦</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar Coca, Arroz, Detergente..."
            placeholderTextColor="#999"
            value={termo}
            onChangeText={setTermo}
          />
          {termo.length > 0 && (
            <TouchableOpacity onPress={() => setTermo('')}>
              <Text style={{ color: '#999', fontSize: 14 }}>❌</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#28A745" />
          </View>
        ) : (
          <FlatList
            data={catalogo}
            keyExtractor={(item) => String(item.idProdutoBase)}
            renderItem={({ item }) => {
              const jaAtivado = idsAtivados.includes(item.idProdutoBase);

              return (
                <View style={[styles.cardItem, jaAtivado && { backgroundColor: '#F8F9FA', opacity: 0.85 }]}>
                  <View style={styles.imageBox}>
                    {item.imagemUrl ? (
                      <Image source={{ uri: item.imagemUrl }} style={styles.thumbImage} />
                    ) : (
                      <Text style={{ fontSize: 24 }}>📦</Text>
                    )}
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.nomeItem} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={styles.subtextItem}>
                      EAN: {item.codigoBarra || 'Sem código'} | {item.categoria?.nome || 'Geral'}
                    </Text>
                  </View>

                  {jaAtivado ? (
                    <View style={[styles.btnAtivar, { backgroundColor: '#E2E3E5', borderColor: '#CED4DA', borderWidth: 1 }]}>
                      <Text style={{ color: '#6C757D', fontSize: 12, fontWeight: 'bold' }}>✓ Ativado</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnAtivar}
                      onPress={() => abrirModalAtivacao(item)}
                    >
                      <Text style={styles.btnAtivarText}>+ Ativar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum produto encontrado no catálogo global.
              </Text>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
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
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ativar no Estoque</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {produtoSelecionado?.nome}
            </Text>

            <Text style={styles.labelInput}>Preço de Venda (R$):</Text>
            <TextInput
              style={styles.precoInput}
              placeholder="0,00"
              keyboardType="numeric"
              value={preco}
              onChangeText={setPreco}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnCancelar]}
                onPress={() => setModalVisivel(false)}
                disabled={salvando}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModal, styles.btnConfirmar]}
                onPress={confirmarAtivacao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnConfirmarText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
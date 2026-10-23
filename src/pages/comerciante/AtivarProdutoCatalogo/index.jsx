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
} from 'react-native';
import api from '../../../services/api';
import { styles } from './styles';

export default function AtivarProdutoCatalogo({ navigation, route }) {
  // ID do mercadinho logado (pode vir via props/route/contexto)
  const idMercadinho = route?.params?.idMercadinho || 1;

  const [termo, setTermo] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [idsAtivados, setIdsAtivados] = useState([]); // Guarda os IDs dos produtos já no estoque
  const [loading, setLoading] = useState(false);

  // Estados para o Modal de Ativação
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Carrega os produtos que este mercadinho já possui no estoque
  const carregarProdutosJaAtivados = useCallback(async () => {
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

  // Busca produtos no Catálogo Global
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
      Alert.alert('Erro', 'Não foi possível carregar os produtos do catálogo.');
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

  // Abre modal para digitar o preço
  const abrirModalAtivacao = (item) => {
    setProdutoSelecionado(item);
    setPreco('');
    setModalVisivel(true);
  };

  // Envia a requisição POST para vincular/ativar o produto no estoque
  const confirmarAtivacao = async () => {
    const precoNumerico = parseFloat(preco.replace(',', '.'));

    if (!preco || isNaN(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Atenção', 'Informe um preço válido maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        idMercadinho,
        idProdutoBase: produtoSelecionado.idProdutoBase,
        preco: precoNumerico,
        ativo: true,
      };

      await api.post('/api/produtos/ativar-do-catalogo', payload);

      // Atualiza o estado local imediatamente marcando o produto como ativado
      setIdsAtivados((prev) => [...prev, produtoSelecionado.idProdutoBase]);

      Alert.alert(
        'Sucesso! 🎉',
        `"${produtoSelecionado.nome}" foi adicionado ao seu estoque por R$ ${precoNumerico.toFixed(2)}.`
      );

      setModalVisivel(false);
      setProdutoSelecionado(null);
    } catch (error) {
      console.error('Erro ao ativar produto:', error);
      const mensagem = error.response?.data?.message || 'Erro ao ativar produto no estoque.';
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho Customizado com Botão de Voltar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 12 }}>
          <Text style={{ fontSize: 16, color: '#007BFF', fontWeight: 'bold' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#212529' }}>Adicionar ao Estoque 📦</Text>
      </View>

      <View style={styles.content}>
        {/* Campo de Busca no Catálogo Global */}
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

        {/* Lista de Produtos do Catálogo Global */}
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

                  {/* Alterna o botão se o item já foi ativado */}
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

      {/* Modal para Informar o Preço de Venda */}
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
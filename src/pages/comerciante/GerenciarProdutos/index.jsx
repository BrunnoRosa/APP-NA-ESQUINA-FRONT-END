import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function GerenciarProdutos({ navigation }) {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados de Cadastro Avulso
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  // Estados do Modal de Edição
  const [modalEditVisivel, setModalEditVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editPreco, setEditPreco] = useState('');

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  // Função utilitária para extrair o idMercadinho do objeto user
  const obterIdMercadinho = () => {
    return user?.idMercadinho || user?.mercadinho?.idMercadinho || user?.idUsuario || user?.id;
  };

  const carregarProdutos = useCallback(async () => {
    const idMercadinho = obterIdMercadinho();
    if (!idMercadinho) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}?t=${new Date().getTime()}`);
      setProdutos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const handleIrParaCatalogoGlobal = () => {
    const idMercadinho = obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta('Erro', 'Mercadinho não identificado. Faça login novamente.');
      return;
    }
    navigation.navigate('AtivarProdutoCatalogo', { idMercadinho });
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !preco.trim()) {
      exibirAlerta('Atenção', 'Preencha o nome e o preço do produto.');
      return;
    }

    const idMercadinho = obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta('Erro', 'Mercadinho não identificado.');
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        nome: nome.trim(),
        preco: parseFloat(preco.replace(',', '.')),
        idMercadinho: Number(idMercadinho),
        categoria: 'OUTROS',
        descricao: '',
        imagemUrl: '',
      };

      await api.post('/api/produtos', payload);

      exibirAlerta('Sucesso', 'Produto cadastrado com sucesso!');
      setNome('');
      setPreco('');
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      exibirAlerta('Erro', 'Não foi possível cadastrar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalEdicao = (produto) => {
    setProdutoEditando(produto);
    setEditNome(produto.nome);
    setEditPreco(String(produto.preco));
    setModalEditVisivel(true);
  };

  const handleSalvarEdicao = async () => {
    if (!editNome.trim() || !editPreco.trim()) {
      exibirAlerta('Atenção', 'Nome e preço são obrigatórios.');
      return;
    }

    setSalvando(true);
    const idProd = produtoEditando.idProduto || produtoEditando.id;

    try {
      await api.put(`/api/produtos/${idProd}`, {
        nome: editNome.trim(),
        preco: parseFloat(editPreco.replace(',', '.')),
      });

      exibirAlerta('Sucesso', 'Produto atualizado com sucesso!');
      setModalEditVisivel(false);
      setProdutoEditando(null);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      exibirAlerta('Erro', 'Não foi possível atualizar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const handleAlternarStatus = (produto) => {
    const idProd = produto.idProduto || produto.id;
    const novoStatus = !(produto.ativo ?? true);
    const acaoTexto = novoStatus ? 'ativar' : 'inativar';

    const executarAlternancia = async () => {
      try {
        await api.put(`/api/produtos/${idProd}/status?ativo=${novoStatus}`);
        exibirAlerta('Sucesso', `O produto "${produto.nome}" foi ${novoStatus ? 'ativado' : 'inativado'} com sucesso.`);
        carregarProdutos();
      } catch (error) {
        console.error(`Erro ao ${acaoTexto} produto:`, error);
        exibirAlerta('Erro', `Não foi possível ${acaoTexto} o produto.`);
      }
    };

    const mensagemConfirmacao = novoStatus 
      ? `Deseja ativar "${produto.nome}"? Ele voltará a ser exibido para os clientes.` 
      : `Deseja inativar "${produto.nome}"? Ele deixará de ser exibido para os clientes.`;

    if (Platform.OS === 'web') {
      if (confirm(mensagemConfirmacao)) {
        executarAlternancia();
      }
    } else {
      Alert.alert(
        `${novoStatus ? 'Ativar' : 'Inativar'} Produto`,
        mensagemConfirmacao,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: novoStatus ? 'Ativar' : 'Inativar', style: novoStatus ? 'default' : 'destructive', onPress: executarAlternancia },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gerir Produtos 📦</Text>
      </View>

      <TouchableOpacity
        style={styles.btnCatalogoGlobal}
        onPress={handleIrParaCatalogoGlobal}
        activeOpacity={0.8}
      >
        <Text style={styles.btnCatalogoGlobalText}>
          🔍 Buscar no Catálogo Global (+100 itens)
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou cadastre um produto avulso</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Novo Produto Avulso</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto (ex: Feijão Preto 1kg)"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço (R$)"
          keyboardType="numeric"
          value={preco}
          onChangeText={setPreco}
        />
        <TouchableOpacity
          style={styles.btnCadastrar}
          onPress={handleCadastrar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.btnCadastrarText}>+ Cadastrar Avulso</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Produtos no Seu Estoque</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => String(item.idProduto || item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isAtivo = item.ativo ?? true;

            return (
              <View style={[styles.productCard, !isAtivo && { opacity: 0.65, backgroundColor: '#F8F9FA' }]}>
                <View style={styles.productMain}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
                    {!isAtivo && (
                      <Text style={{ fontSize: 10, color: '#DC3545', fontWeight: 'bold', backgroundColor: '#F8D7DA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        INATIVO
                      </Text>
                    )}
                  </View>
                  <Text style={styles.productPrice}>
                    {Number(item.preco || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.btnEdit}
                    onPress={() => abrirModalEdicao(item)}
                  >
                    <Text style={styles.btnEditText}>✏️ Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btnDelete,
                      isAtivo 
                        ? { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' } 
                        : { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }
                    ]}
                    onPress={() => handleAlternarStatus(item)}
                  >
                    <Text style={[styles.btnDeleteText, !isAtivo && { color: '#2E7D32' }]}>
                      {isAtivo ? '🚫 Inativar' : '✅ Ativar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal
        visible={modalEditVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEditVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Produto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={editNome}
              onChangeText={setEditNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço (R$)"
              keyboardType="numeric"
              value={editPreco}
              onChangeText={setEditPreco}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancelModal}
                onPress={() => setModalEditVisivel(false)}
                disabled={salvando}
              >
                <Text style={styles.btnCancelModalText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSaveModal}
                onPress={handleSalvarEdicao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.btnSaveModalText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
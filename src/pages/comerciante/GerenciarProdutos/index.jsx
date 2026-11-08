import { Ionicons } from '@expo/vector-icons'; // 🆕
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 🆕
import { useCallback, useState } from 'react'; // ✏️ sem useEffect
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { cores } from '../../../theme'; // 🆕
import { traduzirErro, validarNomeProduto, validarPreco } from '../../../utils/validacoes';
import { styles } from './styles';

export default function GerenciarProdutos({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const colunasProdutos = width >= 1440 ? 3 : width >= 900 ? 2 : 1;
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

    // Toast central (em vez do alert do navegador). Mesmo formato: exibirAlerta(titulo, mensagem)
  const { exibirAlerta } = useToast();

  // Obter o ID do Mercadinho resolvendo a divergência entre comerciante_id e id_mercadinho
  const obterIdMercadinho = useCallback(async () => {
    // 1. Tenta obter diretamente do objeto user
    let idMerc = user?.idMercadinho || user?.mercadinho?.idMercadinho || user?.mercadinho?.id;
    if (idMerc) return idMerc;

    // 2. Se apenas tivermos o ID do comerciante/utilizador, consulta a API para obter o idMercadinho real
    const idComerciante = user?.idUsuario || user?.id;
    if (idComerciante) {
      try {
        // Ajuste esta rota para o endpoint de busca de mercadinho por comerciante, se existir
        const res = await api.get(`/api/mercadinhos/comerciante/${idComerciante}`);
        if (res.data?.idMercadinho || res.data?.id) {
          return res.data.idMercadinho || res.data.id;
        }
      } catch (e) {
        console.warn('⚠️ Não foi possível obter idMercadinho por endpoint:', e);
      }
    }
    return null; // ✏️ antes devolvia o id do usuário (que não é o id da loja)
  }, [user]);

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const idMercadinho = await obterIdMercadinho();

      if (!idMercadinho) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}?t=${new Date().getTime()}`);

      let listaProdutos = [];
      if (Array.isArray(response.data)) {
        listaProdutos = response.data;
      } else if (Array.isArray(response.data?.content)) {
        listaProdutos = response.data.content;
      } else if (Array.isArray(response.data?.produtos)) {
        listaProdutos = response.data.produtos;
      }

      setProdutos(listaProdutos);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [obterIdMercadinho]);

  // 🗑️ removido o useEffect duplicado: o useFocusEffect já carrega ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const handleIrParaCatalogoGlobal = async () => {
    const idMercadinho = await obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta('Erro', 'Mercadinho não identificado. Faça login novamente.');
      return;
    }
    navigation.navigate('AtivarProdutoCatalogo', { idMercadinho });
  };

  const handleCadastrar = async () => {
        // Cada validação devolve o texto do erro (ou '' se estiver OK) e mostra no toast
    const erroNome = validarNomeProduto(nome);
    if (erroNome) {
      exibirAlerta('Atenção', erroNome, 'aviso');
      return;
    }
    const erroPreco = validarPreco(preco);
    if (erroPreco) {
      exibirAlerta('Atenção', erroPreco, 'aviso');
      return;
    }
    const precoNumerico = parseFloat(preco.replace(',', '.'));

    const idMercadinho = await obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta('Erro', 'Mercadinho não identificado.');
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        nome: nome.trim(),
        preco: precoNumerico,
        idMercadinho: Number(idMercadinho),
        categoria: 'OUTROS',
        descricao: '',
        imagemUrl: '',
      };

      await api.post('/api/produtos', payload);
      exibirAlerta('Sucesso', 'Produto cadastrado com sucesso!');
      setNome('');
      setPreco('');
      await carregarProdutos();
    } catch (error) {
      console.error('❌ Erro ao cadastrar produto:', error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalEdicao = (produto) => {
    const nomeExibicao = produto.nome || produto.nomePersonalizado || produto.produtoBase?.nome || '';
    setProdutoEditando(produto);
    setEditNome(nomeExibicao);
    setEditPreco(String(produto.preco));
    setModalEditVisivel(true);
  };

  const handleSalvarEdicao = async () => {
    const erroNome = validarNomeProduto(editNome);
    if (erroNome) {
      exibirAlerta('Atenção', erroNome, 'aviso');
      return;
    }
    const erroPreco = validarPreco(editPreco);
    if (erroPreco) {
      exibirAlerta('Atenção', erroPreco, 'aviso');
      return;
    }
    const precoEditado = parseFloat(editPreco.replace(',', '.'));

    setSalvando(true);
    const idProd = produtoEditando.idProduto || produtoEditando.id;

    try {
      await api.put(`/api/produtos/${idProd}`, {
        nome: editNome.trim(),
        preco: precoEditado,
      });

      exibirAlerta('Sucesso', 'Produto atualizado com sucesso!');
      setModalEditVisivel(false);
      setProdutoEditando(null);
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const handleAlternarStatus = (produto) => {
    const idProd = produto.idProduto || produto.id;
    const novoStatus = !(produto.ativo ?? true);
    const acaoTexto = novoStatus ? 'ativar' : 'inativar';
    const nomeExibicao = produto.nome || produto.nomePersonalizado || produto.produtoBase?.nome || 'este produto';

    const executarAlternancia = async () => {
      try {
        await api.put(`/api/produtos/${idProd}/status?ativo=${novoStatus}`);
        exibirAlerta('Sucesso', `O produto "${nomeExibicao}" foi ${novoStatus ? 'ativado' : 'inativado'} com sucesso.`);
        await carregarProdutos();
      } catch (error) {
        console.error(`Erro ao ${acaoTexto} produto:`, error);
        const erro = traduzirErro(error);
        exibirAlerta(erro.titulo, erro.mensagem);
      }
    };

    const mensagemConfirmacao = novoStatus
      ? `Deseja ativar "${nomeExibicao}"?`
      : `Deseja inativar "${nomeExibicao}"?`;

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

  // ✏️ Visual novo a partir daqui

  // 🆕 Tudo o que fica ACIMA da lista (vai dentro da mesma rolagem)
  const cabecalhoLista = (
    <View>
      <TouchableOpacity
        style={[styles.btnCatalogo, isDesktop && styles.btnCatalogoDesktop]}
        onPress={handleIrParaCatalogoGlobal}
        activeOpacity={0.85}
      >
        <Ionicons name="search" size={18} color="#FFFFFF" />
        <Text style={styles.btnCatalogoTexto}>Buscar no catálogo global</Text>
      </TouchableOpacity>

      <View style={[styles.divisorLinha, isDesktop && styles.divisorLinhaDesktop]}>
        <View style={styles.divisorTraco} />
        <Text style={styles.divisorTexto}>ou cadastre um produto avulso</Text>
        <View style={styles.divisorTraco} />
      </View>

      <View style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
        <Text style={styles.formTitulo}>Novo produto avulso</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do produto (ex: Feijão Preto 1kg)"
          placeholderTextColor={cores.icone}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço (R$)"
          placeholderTextColor={cores.icone}
          keyboardType="numeric"
          value={preco}
          onChangeText={setPreco}
        />
        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={handleCadastrar}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimarioTexto}>Cadastrar avulso</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.secaoTitulo, isDesktop && styles.secaoTituloDesktop]}>Produtos no seu estoque</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🆕 Topo com degradê (aba: sem botão voltar) */}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={[styles.topo, isDesktop && styles.topoDesktop]}
      >
        <Text style={[styles.titulo, isDesktop && styles.tituloDesktop]}>Meus produtos</Text>
        {!loading && produtos.length > 0 && (
          <Text style={styles.subtitulo}>
            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
          </Text>
        )}
      </LinearGradient>

      {/* 🆕 Folha branca arredondada */}
      <View style={[styles.folha, isDesktop && styles.folhaDesktop]}>
        <FlatList
          key={isDesktop ? `desktop-${colunasProdutos}` : 'mobile'}
          data={loading ? [] : produtos}
          numColumns={colunasProdutos}
          columnWrapperStyle={colunasProdutos > 1 ? styles.produtosLinha : undefined}
          contentContainerStyle={[styles.lista, isDesktop && styles.listaDesktop]}
          keyExtractor={(item, index) => String(item?.idProduto || item?.id || index)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={cabecalhoLista}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={cores.primaria} style={{ marginTop: 24 }} />
            ) : (
              <Text style={styles.vazioTexto}>Nenhum produto cadastrado ainda.</Text>
            )
          }
          renderItem={({ item }) => {
            const isAtivo = item.ativo ?? true;
            // Trata o nome caso nome_personalizado seja NULL na base de dados
            const nomeExibicao = item.nome || item.nomePersonalizado || item.produtoBase?.nome || 'Produto sem nome';

            return (
              <View style={[styles.produtoCard, isDesktop && styles.produtoCardDesktop, !isAtivo && styles.produtoInativo]}>
                <View style={styles.produtoTopo}>
                  <View style={styles.produtoNomeLinha}>
                    <Text style={styles.produtoNome} numberOfLines={1}>{nomeExibicao}</Text>
                    {!isAtivo && (
                      <View style={styles.tagInativo}>
                        <Text style={styles.tagInativoTexto}>INATIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.produtoPreco}>
                    {Number(item.preco || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </Text>
                </View>

                <View style={styles.acoesLinha}>
                  <TouchableOpacity
                    style={[styles.btnAcao, styles.btnContorno]}
                    onPress={() => abrirModalEdicao(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="create-outline" size={16} color={cores.primaria} />
                    <Text style={styles.btnContornoTexto}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAcao, isAtivo ? styles.btnContorno : styles.btnSucesso]}
                    onPress={() => handleAlternarStatus(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={isAtivo ? 'ban-outline' : 'checkmark-circle-outline'}
                      size={16}
                      color={isAtivo ? cores.primaria : '#FFFFFF'}
                    />
                    <Text style={isAtivo ? styles.btnContornoTexto : styles.btnSucessoTexto}>
                      {isAtivo ? 'Inativar' : 'Ativar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Modal
        visible={modalEditVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEditVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar produto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              placeholderTextColor={cores.icone}
              value={editNome}
              onChangeText={setEditNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço (R$)"
              placeholderTextColor={cores.icone}
              keyboardType="numeric"
              value={editPreco}
              onChangeText={setEditPreco}
            />

            <View style={styles.modalAcoes}>
              <TouchableOpacity
                style={[styles.btnAcao, styles.btnContorno, { flex: 1 }]}
                onPress={() => setModalEditVisivel(false)}
                disabled={salvando}
                activeOpacity={0.85}
              >
                <Text style={styles.btnContornoTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAcao, styles.btnPrimarioModal, { flex: 1 }]}
                onPress={handleSalvarEdicao}
                disabled={salvando}
                activeOpacity={0.85}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
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
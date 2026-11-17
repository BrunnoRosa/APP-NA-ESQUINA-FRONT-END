import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { usePuxarParaAtualizar } from '../../../hooks/usePuxarParaAtualizar';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { traduzirErro } from '../../../utils/validacoes';
import { styles } from './styles';

const LIMITE_PROMOCOES = 10;

export default function GerenciarVitrine({ navigation }) {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alterandoId, setAlterandoId] = useState(null);

  const [produtoPromoModal, setProdutoPromoModal] = useState(null);
  const [precoPromoInput, setPrecoPromoInput] = useState('');
  const [salvandoPromo, setSalvandoPromo] = useState(false);

  const idMercadinho = user?.idMercadinho;
  const { exibirAlerta } = useToast();

  const carregarProdutos = useCallback(async () => {
    if (!idMercadinho) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(
        `/api/produtos/mercadinho/${idMercadinho}?t=${new Date().getTime()}`
      );
      setProdutos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos para vitrine:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinho]);

  const pull = usePuxarParaAtualizar(carregarProdutos);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const totalDestaques = produtos.filter((p) => p.emDestaque).length;
  const totalPromocoes = produtos.filter((p) => p.emPromocao).length;

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

  const abrirModalPromocao = (produto) => {
    if (produto.ativo === false) {
      exibirAlerta(
        'Produto inativo',
        'Ative este produto no seu estoque antes de colocá-lo em promoção.'
      );
      return;
    }

    if (!produto.emPromocao && totalPromocoes >= LIMITE_PROMOCOES) {
      exibirAlerta(
        'Limite de promoções atingido',
        `Cada mercadinho pode manter até ${LIMITE_PROMOCOES} produtos em promoção por vez. Encerre uma promoção ativa para liberar vaga.`,
        'erro'
      );
      return;
    }

    setProdutoPromoModal(produto);
    if (produto.emPromocao && produto.precoPromocional) {
      setPrecoPromoInput(String(Number(produto.precoPromocional).toFixed(2)).replace('.', ','));
    } else {
      setPrecoPromoInput('');
    }
  };

  const salvarPromocao = async () => {
    if (!produtoPromoModal) return;

    const valorNumerico = parseFloat(precoPromoInput.replace(',', '.'));
    const precoNormal = Number(produtoPromoModal.preco || 0);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      exibirAlerta('Valor inválido', 'Informe um preço promocional maior que R$ 0,00.');
      return;
    }

    if (valorNumerico >= precoNormal) {
      exibirAlerta(
        'Preço inválido',
        `O preço promocional precisa ser menor que o preço atual (R$ ${precoNormal
          .toFixed(2)
          .replace('.', ',')}).`
      );
      return;
    }

    try {
      setSalvandoPromo(true);
      await api.put(
        `/api/produtos/${produtoPromoModal.idProduto}/promocao?emPromocao=true&precoPromocional=${valorNumerico.toFixed(2)}`
      );
      exibirAlerta(
        'Promoção ativada!',
        `"${produtoPromoModal.nome}" agora está em oferta por R$ ${valorNumerico
          .toFixed(2)
          .replace('.', ',')}.`
      );
      setProdutoPromoModal(null);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvandoPromo(false);
    }
  };

  const encerrarPromocao = async () => {
    if (!produtoPromoModal) return;

    try {
      setSalvandoPromo(true);
      await api.put(`/api/produtos/${produtoPromoModal.idProduto}/promocao?emPromocao=false`);
      exibirAlerta(
        'Promoção encerrada',
        `"${produtoPromoModal.nome}" voltou ao preço normal.`
      );
      setProdutoPromoModal(null);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao encerrar promoção:', error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvandoPromo(false);
    }
  };

  const valorDigitado = parseFloat(precoPromoInput.replace(',', '.'));
  const precoBaseModal = Number(produtoPromoModal?.preco || 0);
  const descontoPreview =
    Number.isFinite(valorDigitado) && valorDigitado > 0 && valorDigitado < precoBaseModal
      ? Math.round(((precoBaseModal - valorDigitado) / precoBaseModal) * 100)
      : null;

  const cabecalhoLista = (
    <View style={styles.banner}>
      <View style={styles.bannerIcone}>
        <Ionicons name="pricetags-outline" size={22} color={cores.primaria} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitulo}>Destaques vs. Promoções</Text>
        <Text style={styles.bannerTexto}>
          <Text style={{ fontWeight: 'bold' }}>Destaque:</Text> exibe o item no topo da Home.{'\n'}
          <Text style={{ fontWeight: 'bold' }}>Promoção:</Text> aplica desconto real (De / Por) na aba Promoções (limite de {LIMITE_PROMOCOES} itens).
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {pull.indicador}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <Text style={styles.titulo}>Ofertas e destaques</Text>
        {!loading && produtos.length > 0 && (
          <Text style={styles.subtitulo}>
            {totalDestaques} em destaque • {totalPromocoes} de {LIMITE_PROMOCOES} promoções ativas
          </Text>
        )}
      </LinearGradient>

      <View style={styles.folha}>
        <FlatList
          {...pull.props}
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
            const precoNormal = Number(item.preco || 0);
            const temPromo =
              item.emPromocao === true &&
              item.precoPromocional != null &&
              Number(item.precoPromocional) < precoNormal;
            const precoPromo = temPromo ? Number(item.precoPromocional) : null;
            const percentual = temPromo
              ? Math.round(((precoNormal - precoPromo) / precoNormal) * 100)
              : 0;

            return (
              <View style={styles.cardItem}>
                <View style={styles.foto}>
                  {item.imagemUrl ? (
                    <Image
                      source={{ uri: item.imagemUrl }}
                      style={styles.imagem}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="cube" size={24} color={cores.icone} />
                  )}
                </View>

                <View style={styles.info}>
                  <Text style={styles.nomeProduto} numberOfLines={2}>
                    {item.nome}
                  </Text>

                  {temPromo ? (
                    <View>
                      <Text style={styles.precoAntigo}>
                        De R$ {precoNormal.toFixed(2).replace('.', ',')}
                      </Text>
                      <View style={styles.linhaPromo}>
                        <Text style={styles.precoNovo}>
                          R$ {precoPromo.toFixed(2).replace('.', ',')}
                        </Text>
                        <View style={styles.badgeDesconto}>
                          <Text style={styles.badgeDescontoTexto}>-{percentual}%</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.precoProduto}>
                      R$ {precoNormal.toFixed(2).replace('.', ',')}
                    </Text>
                  )}
                </View>

                {isBusy ? (
                  <ActivityIndicator size="small" color={cores.primaria} />
                ) : (
                  <View style={styles.colunaBotoes}>
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
                        size={14}
                        color={item.emDestaque ? '#FFFFFF' : cores.primaria}
                      />
                      <Text
                        style={item.emDestaque ? styles.btnTextoAtivo : styles.btnTextoInativo}
                      >
                        {item.emDestaque ? 'Destaque' : 'Destacar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btnPromo,
                        temPromo ? styles.btnPromoAtivo : styles.btnPromoInativo,
                      ]}
                      onPress={() => abrirModalPromocao(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={temPromo ? 'pricetag' : 'pricetag-outline'}
                        size={14}
                        color={temPromo ? '#FFFFFF' : '#168A00'}
                      />
                      <Text
                        style={
                          temPromo ? styles.btnPromoTextoAtivo : styles.btnPromoTextoInativo
                        }
                      >
                        {temPromo ? 'Em promo' : 'Promoção'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>

      <Modal
        visible={Boolean(produtoPromoModal)}
        transparent
        animationType="fade"
        onRequestClose={() => !salvandoPromo && setProdutoPromoModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {produtoPromoModal?.emPromocao ? 'Gerenciar promoção' : 'Criar promoção'}
            </Text>
            <Text style={styles.modalProdutoNome}>{produtoPromoModal?.nome}</Text>
            <Text style={styles.modalPrecoAtual}>
              Preço atual: R$ {precoBaseModal.toFixed(2).replace('.', ',')}
            </Text>

            <Text style={styles.inputLabel}>Preço promocional (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 6,99"
              keyboardType="decimal-pad"
              value={precoPromoInput}
              onChangeText={setPrecoPromoInput}
              editable={!salvandoPromo}
            />

            {descontoPreview !== null && (
              <View style={styles.previewBox}>
                <Text style={styles.previewTexto}>
                  Desconto exibido ao cliente: <Text style={{ fontWeight: 'bold' }}>-{descontoPreview}%</Text>
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalBtnSalvar, salvandoPromo && { opacity: 0.7 }]}
              onPress={salvarPromocao}
              disabled={salvandoPromo}
            >
              {salvandoPromo ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalBtnSalvarTexto}>Salvar promoção</Text>
              )}
            </TouchableOpacity>

            {produtoPromoModal?.emPromocao && (
              <TouchableOpacity
                style={styles.modalBtnEncerrar}
                onPress={encerrarPromocao}
                disabled={salvandoPromo}
              >
                <Text style={styles.modalBtnEncerrarTexto}>Encerrar promoção</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalBtnCancelar}
              onPress={() => setProdutoPromoModal(null)}
              disabled={salvandoPromo}
            >
              <Text style={styles.modalBtnCancelarTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
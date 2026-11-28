import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BotaoCarrinho from '../../../components/BotaoCarrinho';
import { useCarrinho } from '../../../context/CarrinhoContext';
import {
  CATEGORIAS_LISTA,
  TEMPLATES_LISTA,
  UNIDADES_LISTA,
  inferirCategoria,
  useListaCompras,
} from '../../../context/ListaComprasContext';
import { useLocalizacao } from '../../../context/LocalizacaoContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { compararListaNosMercadinhos, obterPrecoProduto } from '../../../utils/comparadorLista';
import { styles } from './styles';
import ScrollHorizontal from '../../../components/ScrollHorizontal';

export default function ListaCompras({ navigation }) {
  const {
    listas,
    listaAtiva,
    selecionarLista,
    criarLista,
    duplicarLista,
    excluirLista,
    adicionarItem,
    alternarMarcado,
    atualizarQuantidade,
    removerItem,
    limparMarcados,
    desmarcarTodos,
  } = useListaCompras();

  const { adicionarAoCarrinho } = useCarrinho();
  const { origem } = useLocalizacao();

  const [abaAtiva, setAbaAtiva] = useState('LISTA'); // 'LISTA' | 'COMPARAR'
  const [textoBusca, setTextoBusca] = useState('');
  const [quantidadeNovo, setQuantidadeNovo] = useState(1);
  const [unidadeNovo, setUnidadeNovo] = useState('un');
  const [categoriaNovo, setCategoriaNovo] = useState('AUTO');
  const [mostrarOpcoesAvancadas, setMostrarOpcoesAvancadas] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // 'TODOS' | 'PENDENTES' | 'PEGOS'
  const [mercadinhos, setMercadinhos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);
  const [mercadoExpandidoId, setMercadoExpandidoId] = useState(null);

  const [modalNovaLista, setModalNovaLista] = useState(false);
  const [nomeNovaLista, setNomeNovaLista] = useState('');

  const formatarUrlImagem = (url) => {
    if (!url) return null;
    if (typeof url === 'string') {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      const baseURL = api.defaults?.baseURL || 'http://localhost:8080';
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${baseURL}${path}`;
    }
    return url;
  };

  const carregarCatalogo = useCallback(async () => {
    setCarregandoCatalogo(true);
    try {
      const resMercadinhos = await api.get('/api/mercadinhos');
      const lojas = resMercadinhos.data || [];
      setMercadinhos(lojas);

      if (lojas.length > 0) {
        const produtosPorLoja = await Promise.all(
          lojas.map((loja) =>
            api
              .get(`/api/produtos/mercadinho/${loja.idMercadinho || loja.id}`)
              .then((res) =>
                (res.data || []).map((p) => {
                  const imgTratada = formatarUrlImagem(p.imagemUrl || p.imagem || p.foto);
                  return {
                    ...p,
                    idMercadinho: loja.idMercadinho || loja.id,
                    nomeMercadinho: loja.nomeFantasia,
                    imagem: imgTratada,
                    imagemUrl: imgTratada,
                  };
                })
              )
              .catch(() => [])
          )
        );
        setTodosProdutos(produtosPorLoja.flat());
      }
    } catch (error) {
      console.error('Erro ao carregar catálogo para lista de compras:', error);
    } finally {
      setCarregandoCatalogo(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCatalogo();
    }, [carregarCatalogo])
  );

  // Sugestões em tempo real baseadas nos produtos dos mercadinhos próximos
  const sugestoesCatalogo = useMemo(() => {
    const termo = textoBusca.trim().toLowerCase();
    if (termo.length < 2) return [];

    const agrupadoPorNome = new Map();

    for (const prod of todosProdutos) {
      if (prod.ativo === false) continue;
      const nomeProd = prod.nome || '';
      if (!nomeProd.toLowerCase().includes(termo)) continue;

      const chave = nomeProd.trim().toLowerCase();
      const preco = obterPrecoProduto(prod);
      const existente = agrupadoPorNome.get(chave);

      if (!existente || (preco > 0 && preco < existente.menorPreco)) {
        agrupadoPorNome.set(chave, {
          produtoId: prod.idProduto || prod.id,
          nome: nomeProd,
          menorPreco: preco,
          imagem: prod.imagem,
          nomeMercadinho: prod.nomeMercadinho,
        });
      }
    }

    return Array.from(agrupadoPorNome.values()).slice(0, 5);
  }, [textoBusca, todosProdutos]);

  const handleAdicionarManual = () => {
    if (!textoBusca.trim()) return;
    const catFinal = categoriaNovo === 'AUTO' ? inferirCategoria(textoBusca) : categoriaNovo;

    adicionarItem({
      nome: textoBusca.trim(),
      quantidade: quantidadeNovo,
      unidade: unidadeNovo,
      categoria: catFinal,
    });

    setTextoBusca('');
    setQuantidadeNovo(1);
    setMostrarOpcoesAvancadas(false);
  };

  const handleAdicionarSugestao = (sugestao) => {
    adicionarItem({
      nome: sugestao.nome,
      quantidade: quantidadeNovo,
      unidade: 'un',
      categoria: inferirCategoria(sugestao.nome),
      produtoId: sugestao.produtoId,
      precoReferencia: sugestao.menorPreco || null,
      imagem: sugestao.imagem || null,
    });

    setTextoBusca('');
    setQuantidadeNovo(1);
    setMostrarOpcoesAvancadas(false);
  };

  // Itens filtrados e agrupados por categoria
  const itensFiltrados = useMemo(() => {
    const itens = listaAtiva?.itens || [];
    if (filtroStatus === 'PENDENTES') return itens.filter((i) => !i.marcado);
    if (filtroStatus === 'PEGOS') return itens.filter((i) => i.marcado);
    return itens;
  }, [listaAtiva?.itens, filtroStatus]);

  const secoesPorCategoria = useMemo(() => {
    return CATEGORIAS_LISTA.map((cat) => ({
      ...cat,
      itens: itensFiltrados.filter((item) => (item.categoria || 'OUTROS') === cat.id),
    })).filter((secao) => secao.itens.length > 0);
  }, [itensFiltrados]);

  // Métricas da lista ativa
  const totalItens = listaAtiva?.itens?.length || 0;
  const totalMarcados = (listaAtiva?.itens || []).filter((i) => i.marcado).length;
  const progressoPercent = totalItens > 0 ? Math.round((totalMarcados / totalItens) * 100) : 0;

  const estimativaLista = useMemo(() => {
    return (listaAtiva?.itens || []).reduce((acc, item) => {
      if (!item.precoReferencia) return acc;
      const mult = item.unidade === 'g' || item.unidade === 'ml' ? 1 : item.quantidade;
      return acc + item.precoReferencia * mult;
    }, 0);
  }, [listaAtiva?.itens]);

  // Comparação entre mercadinhos (considera itens pendentes ou toda a lista se todos marcados)
  const comparacaoMercados = useMemo(() => {
    const itensParaComparar = (listaAtiva?.itens || []).filter((i) => !i.marcado);
    const base = itensParaComparar.length > 0 ? itensParaComparar : listaAtiva?.itens || [];

    return compararListaNosMercadinhos({
      itensLista: base,
      mercadinhos,
      todosProdutos,
      origem,
    });
  }, [listaAtiva?.itens, mercadinhos, todosProdutos, origem]);

  const handleCompartilharLista = async () => {
    if (!listaAtiva || listaAtiva.itens.length === 0) {
      Alert.alert('Lista vazia', 'Adicione itens antes de compartilhar sua lista.');
      return;
    }

    const linhas = listaAtiva.itens.map(
      (i) => `${i.marcado ? '✅' : '⬜'} ${i.quantidade} ${i.unidade} - ${i.nome}`
    );

    const mensagem = `🛒 *${listaAtiva.nome}* (App Na Esquina)\n\n${linhas.join('\n')}`;

    try {
      await Share.share({ message: mensagem });
    } catch (err) {
      console.error('Erro ao compartilhar lista:', err);
    }
  };

  const handleEnviarParaCarrinho = (resultadoMercado) => {
    if (!resultadoMercado?.itensEncontrados?.length) return;

    for (const match of resultadoMercado.itensEncontrados) {
      const qtd =
        match.itemLista.unidade === 'g' || match.itemLista.unidade === 'ml'
          ? 1
          : Math.max(1, Math.round(match.itemLista.quantidade));

      for (let i = 0; i < qtd; i++) {
        adicionarAoCarrinho({
          ...match.produtoMercado,
          quantidade: 1,
          idMercadinho: resultadoMercado.idMercadinho,
        });
      }
    }

    Alert.alert(
      'Itens enviados ao carrinho!',
      `${resultadoMercado.itensEncontrados.length} produto(s) de ${resultadoMercado.nomeFantasia} foram adicionados ao seu carrinho.`,
      [
        { text: 'Continuar na lista', style: 'cancel' },
        {
          text: 'Ver loja',
          onPress: () =>
            navigation.navigate('DetalhesMercadinho', {
              idMercadinho: resultadoMercado.idMercadinho,
              mercadinho: resultadoMercado.mercadinho,
            }),
        },
      ]
    );
  };

  const handleConfirmarExcluirLista = () => {
    if (listas.length <= 1) {
      Alert.alert('Atenção', 'Você precisa manter pelo menos uma lista ativa.');
      return;
    }

    Alert.alert(
      'Excluir lista',
      `Deseja remover "${listaAtiva.nome}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirLista(listaAtiva.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho Superior */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>

        <View style={styles.headerCentro}>
          <Text style={styles.headerTitulo}>Lista de Compras</Text>
          <Text style={styles.headerSubtitulo}>Organize e compare preços na região</Text>
        </View>

        <View style={styles.headerAcoes}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleCompartilharLista}>
            <Ionicons name="share-social-outline" size={20} color="#212529" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { marginLeft: 8 }]}
            onPress={() => setModalNovaLista(true)}
          >
            <Ionicons name="add" size={22} color="#212529" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Seletor Horizontal de Listas */}
      <View style={styles.listasBarContainer}>
        <ScrollHorizontal
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listasBarScroll}
        >
          {listas.map((lista) => {
            const ativa = lista.id === listaAtiva?.id;
            return (
              <TouchableOpacity
                key={lista.id}
                style={[styles.listaChip, ativa && styles.listaChipAtiva]}
                onPress={() => selecionarLista(lista.id)}
              >
                <Text style={[styles.listaChipTexto, ativa && styles.listaChipTextoAtiva]}>
                  {lista.nome}
                </Text>
                <View style={[styles.listaChipBadge, ativa && styles.listaChipBadgeAtiva]}>
                  <Text style={[styles.listaChipBadgeTexto, ativa && styles.listaChipBadgeTextoAtiva]}>
                    {lista.itens.length}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.novaListaChip}
            onPress={() => setModalNovaLista(true)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#212529" />
            <Text style={styles.novaListaChipTexto}>Nova lista</Text>
          </TouchableOpacity>
        </ScrollHorizontal>
      </View>

      {/* Folha Branca Principal */}
      <View style={styles.folha}>
        {/* Abas Internas: Minha Lista vs Comparar Preços */}
        <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'LISTA' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('LISTA')}
          >
            <Ionicons
              name="checkbox-outline"
              size={18}
              color={abaAtiva === 'LISTA' ? '#FFFFFF' : '#555555'}
            />
            <Text style={[styles.abaTexto, abaAtiva === 'LISTA' && styles.abaTextoAtiva]}>
              Minha Lista ({totalItens})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'COMPARAR' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('COMPARAR')}
          >
            <Ionicons
              name="pricetags-outline"
              size={18}
              color={abaAtiva === 'COMPARAR' ? '#FFFFFF' : '#555555'}
            />
            <Text style={[styles.abaTexto, abaAtiva === 'COMPARAR' && styles.abaTextoAtiva]}>
              Comparar Preços
            </Text>
          </TouchableOpacity>
        </View>

        {abaAtiva === 'LISTA' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Caixa de Adição Rápida */}
            <View style={styles.inputCard}>
              <View style={styles.inputLinha}>
                <Ionicons name="search-outline" size={20} color="#888888" />
                <TextInput
                  style={styles.inputTexto}
                  placeholder="Adicionar item (ex: Arroz, Leite, Banana...)"
                  placeholderTextColor="#999999"
                  value={textoBusca}
                  onChangeText={setTextoBusca}
                  onSubmitEditing={handleAdicionarManual}
                  returnKeyType="done"
                />
                {textoBusca.length > 0 && (
                  <TouchableOpacity onPress={() => setTextoBusca('')}>
                    <Ionicons name="close-circle" size={18} color="#AAAAAA" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.btnConfigItem}
                  onPress={() => setMostrarOpcoesAvancadas((prev) => !prev)}
                >
                  <Ionicons
                    name={mostrarOpcoesAvancadas ? 'chevron-up' : 'options-outline'}
                    size={20}
                    color={cores.primaria || '#E52421'}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnAdicionar} onPress={handleAdicionarManual}>
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Controles de Quantidade, Unidade e Categoria */}
              {mostrarOpcoesAvancadas && (
                <View style={styles.opcoesAvancadas}>
                  <View style={styles.opcaoLinha}>
                    <Text style={styles.opcaoLabel}>Quantidade:</Text>
                    <View style={styles.qtdControle}>
                      <TouchableOpacity
                        style={styles.qtdBtn}
                        onPress={() => setQuantidadeNovo((q) => Math.max(1, q - 1))}
                      >
                        <Text style={styles.qtdBtnTexto}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtdValor}>{quantidadeNovo}</Text>
                      <TouchableOpacity
                        style={styles.qtdBtn}
                        onPress={() => setQuantidadeNovo((q) => q + 1)}
                      >
                        <Text style={styles.qtdBtnTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ScrollHorizontal
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                  >
                    {UNIDADES_LISTA.map((un) => (
                      <TouchableOpacity
                        key={un}
                        style={[styles.miniChip, unidadeNovo === un && styles.miniChipAtivo]}
                        onPress={() => setUnidadeNovo(un)}
                      >
                        <Text
                          style={[
                            styles.miniChipTexto,
                            unidadeNovo === un && styles.miniChipTextoAtivo,
                          ]}
                        >
                          {un}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollHorizontal>

                  <ScrollHorizontal
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.miniChip,
                        categoriaNovo === 'AUTO' && styles.miniChipAtivo,
                      ]}
                      onPress={() => setCategoriaNovo('AUTO')}
                    >
                      <Text
                        style={[
                          styles.miniChipTexto,
                          categoriaNovo === 'AUTO' && styles.miniChipTextoAtivo,
                        ]}
                      >
                        Automática
                      </Text>
                    </TouchableOpacity>
                    {CATEGORIAS_LISTA.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.miniChip,
                          categoriaNovo === cat.id && styles.miniChipAtivo,
                        ]}
                        onPress={() => setCategoriaNovo(cat.id)}
                      >
                        <Text
                          style={[
                            styles.miniChipTexto,
                            categoriaNovo === cat.id && styles.miniChipTextoAtivo,
                          ]}
                        >
                          {cat.nome}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollHorizontal>
                </View>
              )}

              {/* Autocomplete com produtos reais dos mercadinhos */}
              {sugestoesCatalogo.length > 0 && (
                <View style={styles.sugestoesBox}>
                  <Text style={styles.sugestoesTitulo}>Produtos encontrados na região:</Text>
                  {sugestoesCatalogo.map((sug) => (
                    <TouchableOpacity
                      key={String(sug.produtoId || sug.nome)}
                      style={styles.sugestaoItem}
                      onPress={() => handleAdicionarSugestao(sug)}
                    >
                      {sug.imagem ? (
                        <Image source={{ uri: sug.imagem }} style={styles.sugestaoImg} />
                      ) : (
                        <View style={styles.sugestaoImgPlaceholder}>
                          <Ionicons name="cube-outline" size={16} color="#888888" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sugestaoNome} numberOfLines={1}>
                          {sug.nome}
                        </Text>
                        <Text style={styles.sugestaoPreco}>
                          {sug.menorPreco > 0
                            ? `A partir de R$ ${sug.menorPreco.toFixed(2).replace('.', ',')}`
                            : sug.nomeMercadinho || 'Disponível na região'}
                        </Text>
                      </View>
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color={cores.primaria || '#E52421'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Card de Progresso e Ações da Lista */}
            {totalItens > 0 && (
              <View style={styles.resumoCard}>
                <View style={styles.resumoTopo}>
                  <View>
                    <Text style={styles.resumoTitulo}>
                      {totalMarcados} de {totalItens} itens pegos ({progressoPercent}%)
                    </Text>
                    {estimativaLista > 0 && (
                      <Text style={styles.resumoSubtitulo}>
                        Estimativa base: R$ {estimativaLista.toFixed(2).replace('.', ',')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.resumoAcoes}>
                    <TouchableOpacity
                      style={styles.acaoIconBtn}
                      onPress={() => duplicarLista(listaAtiva.id)}
                    >
                      <Ionicons name="copy-outline" size={18} color="#555555" />
                    </TouchableOpacity>
                    {listas.length > 1 && (
                      <TouchableOpacity
                        style={styles.acaoIconBtn}
                        onPress={handleConfirmarExcluirLista}
                      >
                        <Ionicons name="trash-outline" size={18} color="#E52421" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.barraProgressoFundo}>
                  <View
                    style={[styles.barraProgressoPreenchida, { width: `${progressoPercent}%` }]}
                  />
                </View>

                {/* Filtros e Limpeza */}
                <View style={styles.filtrosLinha}>
                  <View style={styles.filtrosGrupo}>
                    {['TODOS', 'PENDENTES', 'PEGOS'].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.filtroPill, filtroStatus === st && styles.filtroPillAtivo]}
                        onPress={() => setFiltroStatus(st)}
                      >
                        <Text
                          style={[
                            styles.filtroPillTexto,
                            filtroStatus === st && styles.filtroPillTextoAtivo,
                          ]}
                        >
                          {st === 'TODOS' ? 'Todos' : st === 'PENDENTES' ? 'Faltam' : 'Pegos'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {totalMarcados > 0 && (
                    <TouchableOpacity onPress={limparMarcados}>
                      <Text style={styles.limparMarcadosTexto}>Limpar pegos</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Lista Agrupada por Categoria ou Estado Vazio */}
            {totalItens === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="cart-outline" size={52} color="#CCCCCC" />
                <Text style={styles.emptyTitulo}>Sua lista está vazia</Text>
                <Text style={styles.emptySubtitulo}>
                  Digite um produto acima ou escolha um modelo pronto para começar.
                </Text>

                <View style={styles.templatesGrid}>
                  {TEMPLATES_LISTA.map((tpl) => (
                    <TouchableOpacity
                      key={tpl.id}
                      style={styles.templateCard}
                      onPress={() => criarLista(tpl.nome, tpl.itens)}
                    >
                      <Ionicons
                        name={tpl.icone}
                        size={22}
                        color={cores.primaria || '#E52421'}
                      />
                      <Text style={styles.templateNome}>{tpl.nome}</Text>
                      <Text style={styles.templateQtd}>{tpl.itens.length} itens</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              secoesPorCategoria.map((secao) => (
                <View key={secao.id} style={styles.categoriaSecao}>
                  <View style={styles.categoriaHeader}>
                    <Ionicons name={secao.icone} size={16} color={secao.cor} />
                    <Text style={[styles.categoriaTitulo, { color: secao.cor }]}>
                      {secao.nome}
                    </Text>
                    <Text style={styles.categoriaContagem}>({secao.itens.length})</Text>
                  </View>

                  {secao.itens.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.itemCard, item.marcado && styles.itemCardMarcado]}
                    >
                      <TouchableOpacity
                        style={styles.checkboxArea}
                        onPress={() => alternarMarcado(item.id)}
                      >
                        <Ionicons
                          name={item.marcado ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={item.marcado ? '#2E7D32' : '#888888'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.itemInfo}
                        onPress={() => alternarMarcado(item.id)}
                      >
                        <Text
                          style={[styles.itemNome, item.marcado && styles.itemNomeMarcado]}
                          numberOfLines={2}
                        >
                          {item.nome}
                        </Text>
                        <View style={styles.itemMetaLinha}>
                          <Text style={styles.itemQtdTexto}>
                            {item.quantidade} {item.unidade}
                          </Text>
                          {item.precoReferencia ? (
                            <Text style={styles.itemPrecoRef}>
                              • ~R$ {item.precoReferencia.toFixed(2).replace('.', ',')}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>

                      {/* Controle Rápido de Quantidade */}
                      <View style={styles.itemControles}>
                        <TouchableOpacity
                          style={styles.miniQtdBtn}
                          onPress={() => atualizarQuantidade(item.id, -1)}
                        >
                          <Ionicons name="remove" size={14} color="#333333" />
                        </TouchableOpacity>
                        <Text style={styles.miniQtdValor}>{item.quantidade}</Text>
                        <TouchableOpacity
                          style={styles.miniQtdBtn}
                          onPress={() => atualizarQuantidade(item.id, 1)}
                        >
                          <Ionicons name="add" size={14} color="#333333" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.btnRemoverItem}
                          onPress={() => removerItem(item.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#999999" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}

            {totalItens > 0 && totalMarcados === totalItens && (
              <TouchableOpacity style={styles.desmarcarTodosBtn} onPress={desmarcarTodos}>
                <Ionicons name="refresh-outline" size={16} color={cores.primaria || '#E52421'} />
                <Text style={styles.desmarcarTodosTexto}>Reutilizar lista (desmarcar todos)</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          /* ABA 2: COMPARAÇÃO INTELIGENTE DE PREÇOS NOS MERCADINHOS */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View style={styles.compararBanner}>
              <Ionicons name="sparkles" size={20} color="#EF6C00" />
              <Text style={styles.compararBannerTexto}>
                Comparamos os itens da sua lista nos mercadinhos próximos para mostrar onde sai mais
                em conta.
              </Text>
            </View>

            {carregandoCatalogo ? (
              <ActivityIndicator
                size="large"
                color={cores.primaria || '#E52421'}
                style={{ marginTop: 40 }}
              />
            ) : totalItens === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="pricetags-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitulo}>Adicione itens à sua lista</Text>
                <Text style={styles.emptySubtitulo}>
                  Assim que você adicionar itens, calcularemos o total estimado em cada mercadinho.
                </Text>
              </View>
            ) : comparacaoMercados.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="storefront-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitulo}>Nenhum produto correspondente encontrado</Text>
                <Text style={styles.emptySubtitulo}>
                  Tente usar nomes mais simples (ex.: "Arroz", "Leite", "Café") para cruzar com o
                  estoque dos mercadinhos.
                </Text>
              </View>
            ) : (
              comparacaoMercados.map((res) => {
                const expandido = mercadoExpandidoId === res.idMercadinho;
                return (
                  <View key={String(res.idMercadinho)} style={styles.mercadoCompCard}>
                    {/* Selos de Destaque */}
                    <View style={styles.selosLinha}>
                      {res.seloMelhorPreco && (
                        <View style={[styles.seloBadge, { backgroundColor: '#E8F5E9' }]}>
                          <Text style={[styles.seloTexto, { color: '#2E7D32' }]}>
                            Melhor Preço
                          </Text>
                        </View>
                      )}
                      {res.seloListaCompleta && (
                        <View style={[styles.seloBadge, { backgroundColor: '#E3F2FD' }]}>
                          <Text style={[styles.seloTexto, { color: '#1565C0' }]}>
                            Lista Completa
                          </Text>
                        </View>
                      )}
                      {res.seloMaisProximo && (
                        <View style={[styles.seloBadge, { backgroundColor: '#FFF3E0' }]}>
                          <Text style={[styles.seloTexto, { color: '#EF6C00' }]}>
                            Mais Próximo
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.mercadoCompHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mercadoCompNome}>{res.nomeFantasia}</Text>
                        <Text style={styles.mercadoCompMeta}>
                          {res.itensEncontrados.length} de{' '}
                          {res.itensEncontrados.length + res.itensFaltantes.length} itens encontrados
                          {typeof res.distanciaKm === 'number'
                            ? ` • ${res.distanciaKm.toFixed(1)} km`
                            : ''}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.mercadoCompTotalLabel}>Total estimado</Text>
                        <Text style={styles.mercadoCompTotalValor}>
                          R$ {res.totalEstimado.toFixed(2).replace('.', ',')}
                        </Text>
                      </View>
                    </View>

                    {/* Detalhes dos Itens Encontrados / Faltantes */}
                    <TouchableOpacity
                      style={styles.verDetalhesCompBtn}
                      onPress={() =>
                        setMercadoExpandidoId(expandido ? null : res.idMercadinho)
                      }
                    >
                      <Text style={styles.verDetalhesCompTexto}>
                        {expandido ? 'Ocultar itens comparados' : 'Ver itens e preços detalhados'}
                      </Text>
                      <Ionicons
                        name={expandido ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#555555"
                      />
                    </TouchableOpacity>

                    {expandido && (
                      <View style={styles.detalhesCompBox}>
                        {res.itensEncontrados.map((enc) => (
                          <View key={enc.itemLista.id} style={styles.compItemLinha}>
                            <Text style={styles.compItemNome} numberOfLines={1}>
                              ✓ {enc.itemLista.quantidade}x {enc.produtoMercado.nome}
                            </Text>
                            <Text style={styles.compItemPreco}>
                              R$ {enc.subtotal.toFixed(2).replace('.', ',')}
                            </Text>
                          </View>
                        ))}

                        {res.itensFaltantes.map((falt) => (
                          <View key={falt.id} style={styles.compItemLinha}>
                            <Text style={styles.compItemFaltante} numberOfLines={1}>
                              ✕ {falt.nome} (indisponível)
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Botão Principal: Enviar ao Carrinho */}
                    <TouchableOpacity
                      style={styles.enviarCarrinhoBtn}
                      onPress={() => handleEnviarParaCarrinho(res)}
                    >
                      <Ionicons name="cart" size={18} color="#FFFFFF" />
                      <Text style={styles.enviarCarrinhoTexto}>
                        Enviar {res.itensEncontrados.length} item(ns) para o Carrinho
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal: Criar Nova Lista ou Escolher Modelo */}
      <Modal
        visible={modalNovaLista}
        transparent
        animationType="slide"
        onRequestClose={() => setModalNovaLista(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Nova Lista de Compras</Text>
              <TouchableOpacity onPress={() => setModalNovaLista(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da lista (ex: Feira de Sábado)"
              placeholderTextColor="#999999"
              value={nomeNovaLista}
              onChangeText={setNomeNovaLista}
            />

            <TouchableOpacity
              style={styles.modalCriarBtn}
              onPress={() => {
                criarLista(nomeNovaLista || `Lista ${listas.length + 1}`);
                setNomeNovaLista('');
                setModalNovaLista(false);
              }}
            >
              <Text style={styles.modalCriarBtnTexto}>Criar Lista em Branco</Text>
            </TouchableOpacity>

            <Text style={styles.modalSubtitulo}>Ou comece com um modelo pronto:</Text>

            {TEMPLATES_LISTA.map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                style={styles.modalTemplateRow}
                onPress={() => {
                  criarLista(tpl.nome, tpl.itens);
                  setNomeNovaLista('');
                  setModalNovaLista(false);
                }}
              >
                <Ionicons name={tpl.icone} size={20} color={cores.primaria || '#E52421'} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.modalTemplateNome}>{tpl.nome}</Text>
                  <Text style={styles.modalTemplateDesc}>
                    {tpl.itens.map((i) => i.nome).slice(0, 3).join(', ')}...
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#888888" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <BotaoCarrinho navigation={navigation} bottom={24} />
    </View>
  );
}
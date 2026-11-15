import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import FotoProduto from "../../../components/FotoProduto";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { usePuxarParaAtualizar } from "../../../hooks/usePuxarParaAtualizar";
import api from "../../../services/api";
import {
  buscarNoOpenFoodFacts,
  sugerirCategoriaId,
} from "../../../services/openFoodFacts";
import { cores } from "../../../theme";
import {
  traduzirErro,
  validarNomeProduto,
  validarPreco,
} from "../../../utils/validacoes";
import { styles } from "./styles";

// Botões de categoria (usado no cadastro avulso e na edição)
function SeletorCategoria({ categorias, valor, onChange }) {
  return (
    <>
      <Text style={styles.rotuloCampo}>Categoria</Text>
      <View style={styles.chipsLinha}>
        {categorias.map((cat) => {
          const ativo = valor === cat.idCategoria;
          return (
            <TouchableOpacity
              key={cat.idCategoria}
              style={[styles.chip, ativo && styles.chipAtivo]}
              onPress={() => onChange(cat.idCategoria)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                {cat.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
        {categorias.length === 0 && (
          <Text style={styles.rotuloCampo}>Carregando categorias...</Text>
        )}
      </View>
    </>
  );
}

export default function GerenciarProdutos({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const colunasProdutos = width >= 1440 ? 3 : width >= 900 ? 2 : 1;
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados de Cadastro Avulso
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [foto, setFoto] = useState(""); // data URI ou URL do Open Food Facts
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);

  // Estados da Busca Open Food Facts (Cadastro)
  const [termoOff, setTermoOff] = useState("");
  const [buscandoOff, setBuscandoOff] = useState(false);
  const [sugestoesOff, setSugestoesOff] = useState([]);

  // Carrega as categorias uma vez
  useEffect(() => {
    api
      .get("/api/categorias")
      .then((res) => setCategorias(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategorias([]));
  }, []);

  // Estados do Modal de Edição
  const [modalEditVisivel, setModalEditVisivel] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editFoto, setEditFoto] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState(null);
  const [buscandoFotoEdit, setBuscandoFotoEdit] = useState(false);

  const { exibirAlerta, confirmar } = useToast();

  // Obter o ID do Mercadinho
  const obterIdMercadinho = useCallback(async () => {
    let idMerc =
      user?.idMercadinho ||
      user?.mercadinho?.idMercadinho ||
      user?.mercadinho?.id;
    if (idMerc) return idMerc;

    const idComerciante = user?.idUsuario || user?.id;
    if (idComerciante) {
      try {
        const res = await api.get(
          `/api/mercadinhos/comerciante/${idComerciante}`,
        );
        if (res.data?.idMercadinho || res.data?.id) {
          return res.data.idMercadinho || res.data.id;
        }
      } catch (e) {
        console.warn("⚠️ Não foi possível obter idMercadinho por endpoint:", e);
      }
    }
    return null;
  }, [user]);

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const idMercadinho = await obterIdMercadinho();

      if (!idMercadinho) {
        setLoading(false);
        return;
      }

      const response = await api.get(
        `/api/produtos/mercadinho/${idMercadinho}?t=${new Date().getTime()}`,
      );

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
      console.error("❌ Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [obterIdMercadinho]);

  const pull = usePuxarParaAtualizar(carregarProdutos);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos]),
  );

  const handleIrParaCatalogoGlobal = async () => {
    const idMercadinho = await obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta(
        "Erro",
        "Mercadinho não identificado. Faça login novamente.",
      );
      return;
    }
    navigation.navigate("AtivarProdutoCatalogo", { idMercadinho });
  };

  // Busca produto no Open Food Facts por nome ou código de barras
  const handleBuscarOpenFoodFacts = async () => {
    const consulta = termoOff.trim();
    if (consulta.length < 3) {
      exibirAlerta(
        "Atenção",
        "Digite o código de barras ou pelo menos 3 letras do produto.",
        "aviso",
      );
      return;
    }

    setBuscandoOff(true);
    setSugestoesOff([]);
    const resultados = await buscarNoOpenFoodFacts(consulta);
    setBuscandoOff(false);

    if (resultados.length === 0) {
      exibirAlerta(
        "Não encontrado",
        "Nenhum produto encontrado no Open Food Facts para essa busca.",
        "aviso",
      );
      return;
    }

    // Se buscou por código de barras e achou 1 exato, já preenche direto
    if (/^\d{8,14}$/.test(consulta) && resultados.length === 1) {
      selecionarSugestaoOff(resultados[0]);
      return;
    }

    setSugestoesOff(resultados);
  };

  const selecionarSugestaoOff = (item) => {
    setNome(item.nome);
    if (item.imagemUrl) {
      setFoto(item.imagemUrl);
    }
    if (!categoriaId) {
      const catSugerida = sugerirCategoriaId(item, categorias);
      if (catSugerida) setCategoriaId(catSugerida);
    }
    setSugestoesOff([]);
    exibirAlerta(
      "Preenchido",
      item.imagemUrl
        ? "Nome e foto preenchidos! Informe o preço e confirme a categoria."
        : "Nome preenchido (sem foto na base). Informe o preço e a categoria.",
    );
  };

  const handleBuscarFotoNaEdicao = async () => {
    if (editNome.trim().length < 3) {
      exibirAlerta("Atenção", "Informe o nome do produto para buscar a foto.", "aviso");
      return;
    }
    setBuscandoFotoEdit(true);
    const resultados = await buscarNoOpenFoodFacts(editNome.trim());
    setBuscandoFotoEdit(false);

    const comFoto = resultados.find((r) => r.imagemUrl);
    if (comFoto) {
      setEditFoto(comFoto.imagemUrl);
      exibirAlerta("Foto encontrada", "Imagem carregada do Open Food Facts. Clique em Salvar para aplicar.");
    } else {
      exibirAlerta("Sem foto", "Nenhuma imagem encontrada para esse nome no Open Food Facts.", "aviso");
    }
  };

  const handleCadastrar = async () => {
    const erroNome = validarNomeProduto(nome);
    if (erroNome) {
      exibirAlerta("Atenção", erroNome, "aviso");
      return;
    }
    const erroPreco = validarPreco(preco);
    if (erroPreco) {
      exibirAlerta("Atenção", erroPreco, "aviso");
      return;
    }
    if (!categoriaId) {
      exibirAlerta("Atenção", "Escolha a categoria do produto.", "aviso");
      return;
    }
    const precoNumerico = parseFloat(preco.replace(",", "."));

    const idMercadinho = await obterIdMercadinho();
    if (!idMercadinho) {
      exibirAlerta("Erro", "Mercadinho não identificado.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        nome: nome.trim(),
        preco: precoNumerico,
        idMercadinho: Number(idMercadinho),
        idCategoria: categoriaId,
        descricao: "",
        imagemUrl: foto || "",
      };

      await api.post("/api/produtos", payload);
      exibirAlerta("Sucesso", "Produto cadastrado com sucesso!");
      setNome("");
      setPreco("");
      setFoto("");
      setCategoriaId(null);
      setTermoOff("");
      setSugestoesOff([]);
      await carregarProdutos();
    } catch (error) {
      console.error("❌ Erro ao cadastrar produto:", error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalEdicao = (produto) => {
    const nomeExibicao =
      produto.nome ||
      produto.nomePersonalizado ||
      produto.produtoBase?.nome ||
      "";
    setProdutoEditando(produto);
    setEditNome(nomeExibicao);
    setEditPreco(String(produto.preco));
    setEditFoto("");
    setEditCategoriaId(produto.categoria?.idCategoria ?? null);
    setModalEditVisivel(true);
  };

  const handleSalvarEdicao = async () => {
    const erroNome = validarNomeProduto(editNome);
    if (erroNome) {
      exibirAlerta("Atenção", erroNome, "aviso");
      return;
    }
    const erroPreco = validarPreco(editPreco);
    if (erroPreco) {
      exibirAlerta("Atenção", erroPreco, "aviso");
      return;
    }
    const precoEditado = parseFloat(editPreco.replace(",", "."));

    setSalvando(true);
    const idProd = produtoEditando.idProduto || produtoEditando.id;

    try {
      await api.put(`/api/produtos/${idProd}`, {
        nome: editNome.trim(),
        preco: precoEditado,
        ...(editFoto ? { imagemUrl: editFoto } : {}),
        ...(editCategoriaId ? { idCategoria: editCategoriaId } : {}),
      });

      exibirAlerta("Sucesso", "Produto atualizado com sucesso!");
      setModalEditVisivel(false);
      setProdutoEditando(null);
      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const handleAlternarStatus = async (produto) => {
    const idProd = produto.idProduto || produto.id;
    const novoStatus = !(produto.ativo ?? true);
    const acaoTexto = novoStatus ? "ativar" : "inativar";
    const nomeExibicao =
      produto.nome ||
      produto.nomePersonalizado ||
      produto.produtoBase?.nome ||
      "este produto";

    const sim = await confirmar({
      titulo: `${novoStatus ? "Ativar" : "Inativar"} produto`,
      mensagem: `Deseja ${acaoTexto} "${nomeExibicao}"?`,
      textoConfirmar: novoStatus ? "Ativar" : "Inativar",
      tipo: novoStatus ? "sucesso" : "perigo",
    });
    if (!sim) return;

    try {
      await api.put(`/api/produtos/${idProd}/status?ativo=${novoStatus}`);
      exibirAlerta(
        "Sucesso",
        `O produto "${nomeExibicao}" foi ${novoStatus ? "ativado" : "inativado"} com sucesso.`,
      );
      await carregarProdutos();
    } catch (error) {
      console.error(`Erro ao ${acaoTexto} produto:`, error);
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    }
  };

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

      <View
        style={[styles.divisorLinha, isDesktop && styles.divisorLinhaDesktop]}
      >
        <View style={styles.divisorTraco} />
        <Text style={styles.divisorTexto}>ou cadastre um produto avulso</Text>
        <View style={styles.divisorTraco} />
      </View>

      <View style={[styles.formCard, isDesktop && styles.formCardDesktop]}>
        <Text style={styles.formTitulo}>Novo produto avulso</Text>

        {/* Busca automática no Open Food Facts (Nome ou Código de Barras) */}
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 12,
            padding: 10,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#475569",
              marginBottom: 6,
            }}
          >
            Preencher nome e foto automaticamente (Open Food Facts)
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: "#FFFFFF" }]}
              placeholder="Nome ou código de barras (EAN)"
              placeholderTextColor={cores.icone}
              value={termoOff}
              onChangeText={setTermoOff}
              returnKeyType="search"
              onSubmitEditing={handleBuscarOpenFoodFacts}
            />
            <TouchableOpacity
              style={{
                backgroundColor: cores.primaria,
                paddingHorizontal: 14,
                height: 46,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 6,
              }}
              onPress={handleBuscarOpenFoodFacts}
              disabled={buscandoOff}
              activeOpacity={0.85}
            >
              {buscandoOff ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="barcode-outline" size={18} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                    Buscar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {sugestoesOff.length > 0 && (
            <View style={{ marginTop: 10, gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "600" }}>
                  Toque em um item para preencher:
                </Text>
                <TouchableOpacity onPress={() => setSugestoesOff([])}>
                  <Text style={{ fontSize: 11, color: cores.primaria, fontWeight: "700" }}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </View>

              {sugestoesOff.map((sug, idx) => (
                <TouchableOpacity
                  key={`${sug.codigoBarra}-${idx}`}
                  onPress={() => selecionarSugestaoOff(sug)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 10,
                    padding: 8,
                    gap: 10,
                  }}
                >
                  {sug.imagemMiniatura ? (
                    <Image
                      source={{ uri: sug.imagemMiniatura }}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 6,
                        backgroundColor: "#F1F5F9",
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 6,
                        backgroundColor: "#F1F5F9",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="image-outline" size={18} color="#94A3B8" />
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
                      numberOfLines={2}
                    >
                      {sug.nome}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      {sug.imagemUrl ? "Com foto oficial" : "Sem foto"}
                      {sug.codigoBarra ? ` • EAN ${sug.codigoBarra}` : ""}
                    </Text>
                  </View>

                  <Ionicons name="add-circle" size={22} color={cores.primaria} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
        <SeletorCategoria
          categorias={categorias}
          valor={categoriaId}
          onChange={setCategoriaId}
        />
        <FotoProduto valor={foto} onChange={setFoto} />
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

      <Text
        style={[styles.secaoTitulo, isDesktop && styles.secaoTituloDesktop]}
      >
        Produtos no seu estoque
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {pull.indicador}
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={[styles.topo, isDesktop && styles.topoDesktop]}
      >
        <Text style={[styles.titulo, isDesktop && styles.tituloDesktop]}>
          Meus produtos
        </Text>
        {!loading && produtos.length > 0 && (
          <Text style={styles.subtitulo}>
            {produtos.length} {produtos.length === 1 ? "produto" : "produtos"}
          </Text>
        )}
      </LinearGradient>

      <View style={[styles.folha, isDesktop && styles.folhaDesktop]}>
        <FlatList
          {...pull.props}
          key={isDesktop ? `desktop-${colunasProdutos}` : "mobile"}
          data={loading ? [] : produtos}
          numColumns={colunasProdutos}
          columnWrapperStyle={
            colunasProdutos > 1 ? styles.produtosLinha : undefined
          }
          contentContainerStyle={[
            styles.lista,
            isDesktop && styles.listaDesktop,
          ]}
          keyExtractor={(item, index) =>
            String(item?.idProduto || item?.id || index)
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={cabecalhoLista}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={cores.primaria}
                style={{ marginTop: 24 }}
              />
            ) : (
              <Text style={styles.vazioTexto}>
                Nenhum produto cadastrado ainda.
              </Text>
            )
          }
          renderItem={({ item }) => {
            const isAtivo = item.ativo ?? true;
            const nomeExibicao =
              item.nome ||
              item.nomePersonalizado ||
              item.produtoBase?.nome ||
              "Produto sem nome";

            return (
              <View
                style={[
                  styles.produtoCard,
                  isDesktop && styles.produtoCardDesktop,
                  !isAtivo && styles.produtoInativo,
                ]}
              >
                <View style={styles.produtoTopo}>
                  <View style={styles.produtoNomeLinha}>
                    {item.imagemUrl ? (
                      <Image
                        source={{ uri: item.imagemUrl }}
                        style={styles.produtoFoto}
                      />
                    ) : null}
                    <Text style={styles.produtoNome} numberOfLines={1}>
                      {nomeExibicao}
                    </Text>
                    {!isAtivo && (
                      <View style={styles.tagInativo}>
                        <Text style={styles.tagInativoTexto}>INATIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.produtoPreco}>
                    {Number(item.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
                </View>

                <View style={styles.acoesLinha}>
                  <TouchableOpacity
                    style={[styles.btnAcao, styles.btnContorno]}
                    onPress={() => abrirModalEdicao(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={cores.primaria}
                    />
                    <Text style={styles.btnContornoTexto}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btnAcao,
                      isAtivo ? styles.btnContorno : styles.btnSucesso,
                    ]}
                    onPress={() => handleAlternarStatus(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={
                        isAtivo ? "ban-outline" : "checkmark-circle-outline"
                      }
                      size={16}
                      color={isAtivo ? cores.primaria : "#FFFFFF"}
                    />
                    <Text
                      style={
                        isAtivo
                          ? styles.btnContornoTexto
                          : styles.btnSucessoTexto
                      }
                    >
                      {isAtivo ? "Inativar" : "Ativar"}
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

            <TouchableOpacity
              style={[
                styles.btnContorno,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: 10,
                  marginBottom: 10,
                },
              ]}
              onPress={handleBuscarFotoNaEdicao}
              disabled={buscandoFotoEdit}
              activeOpacity={0.85}
            >
              {buscandoFotoEdit ? (
                <ActivityIndicator size="small" color={cores.primaria} />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={16} color={cores.primaria} />
                  <Text style={styles.btnContornoTexto}>
                    Buscar foto pelo nome (Open Food Facts)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Preço (R$)"
              placeholderTextColor={cores.icone}
              keyboardType="numeric"
              value={editPreco}
              onChangeText={setEditPreco}
            />
            <SeletorCategoria
              categorias={categorias}
              valor={editCategoriaId}
              onChange={setEditCategoriaId}
            />
            <FotoProduto
              valor={editFoto}
              onChange={setEditFoto}
              imagemAtual={produtoEditando?.imagemUrl}
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
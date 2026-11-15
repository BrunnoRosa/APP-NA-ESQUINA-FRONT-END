import { Platform } from "react-native";

const HEADERS = {
  Accept: "application/json",
  ...(Platform.OS !== "web"
    ? { "User-Agent": "NaEsquinaApp/1.0 (contato@naesquina.app)" }
    : {}),
};

const CAMPOS =
  "code,product_name,product_name_pt,brands,quantity,categories_tags,image_front_url,image_front_small_url";

function formatarProdutoOff(p) {
  const nomeBase = (p.product_name_pt || p.product_name || "").trim();
  if (!nomeBase) return null;

  const marca = p.brands ? p.brands.split(",")[0].trim() : "";
  const quantidade = (p.quantity || "").trim();

  const partes = [nomeBase];
  if (marca && !nomeBase.toLowerCase().includes(marca.toLowerCase())) {
    partes.push(marca);
  }
  if (
    quantidade &&
    !nomeBase.toLowerCase().includes(quantidade.toLowerCase().replace(/\s+/g, ""))
  ) {
    partes.push(quantidade);
  }

  return {
    codigoBarra: p.code || "",
    nome: partes.join(" "),
    marca,
    quantidade,
    imagemUrl: p.image_front_url || p.image_front_small_url || "",
    imagemMiniatura: p.image_front_small_url || p.image_front_url || "",
    tagsCategoria: Array.isArray(p.categories_tags) ? p.categories_tags : [],
  };
}

/**
 * Busca no Open Food Facts por código de barras (apenas números, 8 a 14 dígitos)
 * ou por nome do produto (mínimo 3 caracteres).
 */
export async function buscarNoOpenFoodFacts(termo) {
  const limpo = String(termo || "").trim();
  if (!limpo) return [];

  const apenasNumeros = limpo.replace(/\D/g, "");
  const isCodigoBarras =
    apenasNumeros === limpo && apenasNumeros.length >= 8 && apenasNumeros.length <= 14;

  try {
    if (isCodigoBarras) {
      const url = `https://world.openfoodfacts.org/api/v2/product/${apenasNumeros}.json?fields=${CAMPOS}`;
      const response = await fetch(url, { headers: HEADERS });
      const data = await response.json();

      if (data?.status === 1 && data?.product) {
        const formatado = formatarProdutoOff(data.product);
        return formatado ? [formatado] : [];
      }
      return [];
    }

    if (limpo.length < 3) return [];

    const url = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      limpo,
    )}&search_simple=1&action=process&json=1&page_size=8&fields=${CAMPOS}`;

    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    const lista = (data?.products || [])
      .map(formatarProdutoOff)
      .filter(Boolean);

    // Prioriza produtos que já têm foto cadastrada
    lista.sort((a, b) => Number(Boolean(b.imagemUrl)) - Number(Boolean(a.imagemUrl)));

    return lista.slice(0, 6);
  } catch (error) {
    console.error("Erro ao consultar Open Food Facts:", error);
    return [];
  }
}

/**
 * Tenta sugerir automaticamente o idCategoria do banco com base no nome/tags do produto.
 */
export function sugerirCategoriaId(itemOff, categorias = []) {
  if (!itemOff || !Array.isArray(categorias) || categorias.length === 0) {
    return null;
  }

  const texto = `${itemOff.nome} ${(itemOff.tagsCategoria || []).join(" ")}`.toLowerCase();

  const regras = [
    { palavras: ["refrigerante", "suco", "água", "agua", "cerveja", "vinho", "energético", "chá", "beverage", "drink"], cat: "bebida" },
    { palavras: ["leite", "queijo", "iogurte", "manteiga", "margarina", "requeijão", "creme de leite", "dairy", "milk", "cheese"], cat: "latic" },
    { palavras: ["detergente", "sabão", "amaciante", "desinfetante", "água sanitária", "limpa", "cleaning"], cat: "limpeza" },
    { palavras: ["shampoo", "sabonete", "creme dental", "desodorante", "absorvente", "papel higiênico", "hygiene"], cat: "higiene" },
    { palavras: ["pão", "torrada", "bisnaguinha", "bolo", "bread", "bakery"], cat: "padaria" },
    { palavras: ["banana", "maçã", "tomate", "cebola", "batata", "fruta", "verdura", "fruit", "vegetable"], cat: "hortifruti" },
    { palavras: ["biscoito", "bolacha", "chocolate", "bala", "salgadinho", "wafer", "cookie", "candy", "snack"], cat: "doce" },
    { palavras: ["café", "cereal", "granola", "aveia", "achocolatado", "geleia", "mel", "coffee", "breakfast"], cat: "matina" },
    { palavras: ["arroz", "feijão", "macarrão", "farinha", "óleo", "azeite", "açúcar", "sal", "molho"], cat: "alimento" },
  ];

  for (const regra of regras) {
    if (regra.palavras.some((p) => texto.includes(p))) {
      const encontrada = categorias.find((c) =>
        (c.nome || "").toLowerCase().includes(regra.cat),
      );
      if (encontrada) return encontrada.idCategoria;
    }
  }

  return null;
}
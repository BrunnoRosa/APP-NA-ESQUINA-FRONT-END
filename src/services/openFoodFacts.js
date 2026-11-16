import { Platform } from "react-native";

const HEADERS = {
  Accept: "application/json",
  ...(Platform.OS !== "web"
    ? { "User-Agent": "NaEsquinaApp/1.0 (contato@naesquina.app)" }
    : {}),
};

const CAMPOS =
  "code,product_name,product_name_pt,brands,quantity,categories_tags,image_front_url,image_front_small_url";

const DOMINIO_FOOD = "https://world.openfoodfacts.org";
const DOMINIO_FOOD_BR = "https://br.openfoodfacts.org";
const DOMINIOS_SECUNDARIOS = [
  "https://world.openbeautyfacts.org",
  "https://world.openproductsfacts.org",
];

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

async function consultarEanEmDominio(dominio, ean) {
  const url = `${dominio}/api/v2/product/${ean}.json?fields=${CAMPOS}`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) return null;

  const data = await response.json();
  if (data?.status === 1 && data?.product) {
    return formatarProdutoOff(data.product);
  }
  return null;
}

async function consultarTextoEmDominio(dominio, termo, pageSize = 8) {
  const url = `${dominio}/cgi/search.pl?search_terms=${encodeURIComponent(
    termo,
  )}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=${CAMPOS}`;

  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) return [];

  const data = await response.json();
  return (data?.products || []).map(formatarProdutoOff).filter(Boolean);
}

/**
 * Busca unificada nas bases Open Food Facts, Open Beauty Facts e Open Products Facts
 * por código de barras (8 a 14 dígitos) ou por nome do produto.
 */
export async function buscarNoOpenFoodFacts(termo) {
  const limpo = String(termo || "").trim();
  if (!limpo) return [];

  const apenasNumeros = limpo.replace(/\D/g, "");
  const isCodigoBarras =
    apenasNumeros === limpo &&
    apenasNumeros.length >= 8 &&
    apenasNumeros.length <= 14;

  try {
    // 1. Busca exata por código de barras
    if (isCodigoBarras) {
      const noFood = await consultarEanEmDominio(DOMINIO_FOOD, apenasNumeros);
      if (noFood) return [noFood];

      // Fallback em paralelo para Higiene/Cosméticos e Limpeza/Utilidades
      const resultadosSecundarios = await Promise.allSettled(
        DOMINIOS_SECUNDARIOS.map((dom) =>
          consultarEanEmDominio(dom, apenasNumeros),
        ),
      );

      for (const res of resultadosSecundarios) {
        if (res.status === "fulfilled" && res.value) {
          return [res.value];
        }
      }
      return [];
    }

    // 2. Busca por nome (mínimo 3 letras)
    if (limpo.length < 3) return [];

    let combinados = await consultarTextoEmDominio(DOMINIO_FOOD_BR, limpo, 8);

    // Se encontrou poucos itens na base de alimentos, complementa com Beauty e Products
    const comFotoNoFood = combinados.filter((item) => Boolean(item.imagemUrl));
    if (comFotoNoFood.length < 2) {
      const extras = await Promise.allSettled(
        DOMINIOS_SECUNDARIOS.map((dom) =>
          consultarTextoEmDominio(dom, limpo, 5),
        ),
      );

      for (const res of extras) {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          combinados = combinados.concat(res.value);
        }
      }
    }

    // Remove eventuais duplicados pelo código de barras
    const vistos = new Set();
    const unicos = combinados.filter((item) => {
      const chave = item.codigoBarra || item.nome.toLowerCase();
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });

    // Prioriza produtos que possuem foto oficial
    unicos.sort(
      (a, b) => Number(Boolean(b.imagemUrl)) - Number(Boolean(a.imagemUrl)),
    );

    return unicos.slice(0, 6);
  } catch (error) {
    console.error("Erro ao consultar bases Open Facts:", error);
    return [];
  }
}

/**
 * Sugere automaticamente o idCategoria do banco com base no nome/tags do produto.
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
    { palavras: ["shampoo", "sabonete", "creme dental", "desodorante", "absorvente", "papel higiênico", "hygiene", "beauty"], cat: "higiene" },
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
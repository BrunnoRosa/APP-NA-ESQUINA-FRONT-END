import { calcularDistanciaKm } from './mercado';

const normalizarTexto = (texto = '') =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

export function obterPrecoProduto(prod) {
  const valor =
    prod?.precoPromocional ??
    prod?.precoOferta ??
    prod?.preco ??
    prod?.valor ??
    0;
  return Number(valor) || 0;
}

function encontrarMelhorMatchNoMercado(itemLista, produtosDoMercado) {
  if (!produtosDoMercado || produtosDoMercado.length === 0) return null;

  // 1. Prioriza vínculo direto por ID de produto
  if (itemLista.produtoId) {
    const porId = produtosDoMercado.find(
      (p) => Number(p.idProduto || p.id) === Number(itemLista.produtoId) && p.ativo !== false
    );
    if (porId) return porId;
  }

  // 2. Busca por correspondência textual (tokens relevantes)
  const termo = normalizarTexto(itemLista.nome);
  if (!termo) return null;

  const palavrasChave = termo.split(/\s+/).filter((p) => p.length >= 3);
  const candidatos = produtosDoMercado.filter((p) => {
    if (p.ativo === false) return false;
    const nomeProd = normalizarTexto(p.nome || p.descricao || '');
    if (nomeProd.includes(termo) || termo.includes(nomeProd)) return true;
    if (palavrasChave.length === 0) return false;
    return palavrasChave.every((palavra) => nomeProd.includes(palavra));
  });

  if (candidatos.length === 0) return null;

  // Retorna a opção mais barata disponível naquela loja
  return candidatos.sort((a, b) => obterPrecoProduto(a) - obterPrecoProduto(b))[0];
}

export function compararListaNosMercadinhos({ itensLista, mercadinhos, todosProdutos, origem }) {
  if (!itensLista || itensLista.length === 0 || !mercadinhos || mercadinhos.length === 0) {
    return [];
  }

  const resultados = mercadinhos.map((mercado) => {
    const idMercado = Number(mercado.idMercadinho || mercado.id);
    const produtosDaLoja = todosProdutos.filter((p) => {
      const idLojaProd = Number(
        p.idMercadinho ||
          p.mercadinhoId ||
          p.id_mercadinho ||
          (typeof p.mercadinho === 'number' ? p.mercadinho : null) ||
          p.mercadinho?.idMercadinho ||
          p.mercadinho?.id
      );
      return idLojaProd === idMercado;
    });

    const itensEncontrados = [];
    const itensFaltantes = [];
    let totalEstimado = 0;

    for (const item of itensLista) {
      const match = encontrarMelhorMatchNoMercado(item, produtosDaLoja);
      if (match) {
        const precoUnitario = obterPrecoProduto(match);
        const multiplicador = item.unidade === 'g' || item.unidade === 'ml' ? 1 : item.quantidade;
        const subtotal = Number((precoUnitario * multiplicador).toFixed(2));
        totalEstimado += subtotal;

        itensEncontrados.push({
          itemLista: item,
          produtoMercado: {
            ...match,
            idMercadinho: idMercado,
            nomeMercadinho: mercado.nomeFantasia,
          },
          precoUnitario,
          subtotal,
        });
      } else {
        itensFaltantes.push(item);
      }
    }

    const distanciaKm = origem
      ? calcularDistanciaKm(origem.lat, origem.lng, mercado.latitude, mercado.longitude)
      : null;

    const cobertura = Math.round((itensEncontrados.length / itensLista.length) * 100);

    return {
      mercadinho: mercado,
      idMercadinho: idMercado,
      nomeFantasia: mercado.nomeFantasia || 'Mercadinho',
      distanciaKm,
      itensEncontrados,
      itensFaltantes,
      totalEstimado: Number(totalEstimado.toFixed(2)),
      cobertura,
      seloMelhorPreco: false,
      seloMaisProximo: false,
      seloListaCompleta: itensFaltantes.length === 0 && itensEncontrados.length > 0,
    };
  });

  // Filtra lojas que têm pelo menos 1 item da lista
  const comItens = resultados.filter((r) => r.itensEncontrados.length > 0);
  if (comItens.length === 0) return [];

  // Ordena priorizando maior quantidade de itens encontrados e menor preço total
  comItens.sort((a, b) => {
    if (b.itensEncontrados.length !== a.itensEncontrados.length) {
      return b.itensEncontrados.length - a.itensEncontrados.length;
    }
    return a.totalEstimado - b.totalEstimado;
  });

  // Marca "Melhor Preço" entre as lojas com maior cobertura
  const maiorCobertura = comItens[0].itensEncontrados.length;
  const elegiveisPreco = comItens.filter((r) => r.itensEncontrados.length === maiorCobertura);
  const maisBarato = [...elegiveisPreco].sort((a, b) => a.totalEstimado - b.totalEstimado)[0];
  if (maisBarato) maisBarato.seloMelhorPreco = true;

  // Marca "Mais Próximo" se houver distância válida
  const comDistancia = comItens.filter((r) => typeof r.distanciaKm === 'number');
  if (comDistancia.length > 0) {
    const maisPerto = [...comDistancia].sort((a, b) => a.distanciaKm - b.distanciaKm)[0];
    if (maisPerto) maisPerto.seloMaisProximo = true;
  }

  return comItens;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@na_esquina:listas_compras_v1';

export const CATEGORIAS_LISTA = [
  { id: 'HORTIFRUTI', nome: 'Hortifruti', icone: 'leaf-outline', cor: '#2E7D32' },
  { id: 'MERCEARIA', nome: 'Mercearia', icone: 'basket-outline', cor: '#EF6C00' },
  { id: 'ACOUGUE', nome: 'Açougue e Frios', icone: 'restaurant-outline', cor: '#C62828' },
  { id: 'PADARIA', nome: 'Padaria e Laticínios', icone: 'cafe-outline', cor: '#8D6E63' },
  { id: 'BEBIDAS', nome: 'Bebidas', icone: 'wine-outline', cor: '#1565C0' },
  { id: 'LIMPEZA', nome: 'Limpeza e Higiene', icone: 'sparkles-outline', cor: '#00838F' },
  { id: 'OUTROS', nome: 'Outros', icone: 'pricetag-outline', cor: '#546E7A' },
];

export const UNIDADES_LISTA = ['un', 'kg', 'g', 'pct', 'L', 'ml', 'cx'];

export const TEMPLATES_LISTA = [
  {
    id: 'cesta_basica',
    nome: 'Compras da Semana',
    icone: 'cart-outline',
    itens: [
      { nome: 'Arroz Branco 5kg', quantidade: 1, unidade: 'pct', categoria: 'MERCEARIA' },
      { nome: 'Feijão Carioca 1kg', quantidade: 2, unidade: 'pct', categoria: 'MERCEARIA' },
      { nome: 'Óleo de Soja 900ml', quantidade: 1, unidade: 'un', categoria: 'MERCEARIA' },
      { nome: 'Açúcar Refinado 1kg', quantidade: 1, unidade: 'pct', categoria: 'MERCEARIA' },
      { nome: 'Café Torrado 500g', quantidade: 1, unidade: 'pct', categoria: 'PADARIA' },
      { nome: 'Leite Integral 1L', quantidade: 4, unidade: 'cx', categoria: 'PADARIA' },
      { nome: 'Peito de Frango', quantidade: 1, unidade: 'kg', categoria: 'ACOUGUE' },
      { nome: 'Banana Prata', quantidade: 1, unidade: 'kg', categoria: 'HORTIFRUTI' },
      { nome: 'Tomate', quantidade: 1, unidade: 'kg', categoria: 'HORTIFRUTI' },
      { nome: 'Detergente Líquido', quantidade: 2, unidade: 'un', categoria: 'LIMPEZA' },
    ],
  },
  {
    id: 'churrasco',
    nome: 'Churrasco na Esquina',
    icone: 'flame-outline',
    itens: [
      { nome: 'Picanha ou Contrafilé', quantidade: 2, unidade: 'kg', categoria: 'ACOUGUE' },
      { nome: 'Linguiça Toscana', quantidade: 1, unidade: 'kg', categoria: 'ACOUGUE' },
      { nome: 'Pão de Alho', quantidade: 2, unidade: 'pct', categoria: 'PADARIA' },
      { nome: 'Carvão Vegetal 3kg', quantidade: 1, unidade: 'pct', categoria: 'OUTROS' },
      { nome: 'Sal Grosso 1kg', quantidade: 1, unidade: 'pct', categoria: 'MERCEARIA' },
      { nome: 'Refrigerante 2L', quantidade: 3, unidade: 'un', categoria: 'BEBIDAS' },
      { nome: 'Cerveja Lata', quantidade: 12, unidade: 'un', categoria: 'BEBIDAS' },
    ],
  },
  {
    id: 'cafe_manha',
    nome: 'Café da Manhã',
    icone: 'cafe-outline',
    itens: [
      { nome: 'Pão Francês', quantidade: 8, unidade: 'un', categoria: 'PADARIA' },
      { nome: 'Manteiga 200g', quantidade: 1, unidade: 'un', categoria: 'PADARIA' },
      { nome: 'Queijo Mussarela', quantidade: 300, unidade: 'g', categoria: 'ACOUGUE' },
      { nome: 'Presunto Cozido', quantidade: 200, unidade: 'g', categoria: 'ACOUGUE' },
      { nome: 'Ovos Brancos (Dúzia)', quantidade: 1, unidade: 'cx', categoria: 'HORTIFRUTI' },
      { nome: 'Mamão Papaia', quantidade: 2, unidade: 'un', categoria: 'HORTIFRUTI' },
    ],
  },
];

export function inferirCategoria(nomeProduto = '') {
  const texto = nomeProduto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/(banana|maca|tomate|cebola|batata|alface|cenoura|limao|laranja|mamao|fruta|verdura|ovo)/.test(texto)) {
    return 'HORTIFRUTI';
  }
  if (/(carne|frango|linguica|bife|peixe|presunto|mussarela|queijo|salsicha|bacon)/.test(texto)) {
    return 'ACOUGUE';
  }
  if (/(pao|leite|manteiga|requeijao|iogurte|bolo|cafe|biscoito|torrada)/.test(texto)) {
    return 'PADARIA';
  }
  if (/(refrigerante|suco|agua|cerveja|vinho|energetico|cha)/.test(texto)) {
    return 'BEBIDAS';
  }
  if (/(detergente|sabao|amaciante|agua sanitaria|papel higienico|shampoo|pasta de dente|desinfetante)/.test(texto)) {
    return 'LIMPEZA';
  }
  if (/(arroz|feijao|oleo|acucar|sal|macarrao|farinha|molho|azeite)/.test(texto)) {
    return 'MERCEARIA';
  }
  return 'OUTROS';
}

const gerarId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

const criarListaPadrao = () => ({
  id: 'lista_principal',
  nome: 'Minha Lista',
  criadaEm: new Date().toISOString(),
  itens: [],
});

const ListaComprasContext = createContext({});

export function ListaComprasProvider({ children }) {
  const [listas, setListas] = useState([criarListaPadrao()]);
  const [listaAtivaId, setListaAtivaId] = useState('lista_principal');
  const [carregandoStorage, setCarregandoStorage] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const parsed = JSON.parse(salvo);
          if (Array.isArray(parsed.listas) && parsed.listas.length > 0) {
            setListas(parsed.listas);
            setListaAtivaId(parsed.listaAtivaId || parsed.listas[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar listas de compras:', err);
      } finally {
        setCarregandoStorage(false);
      }
    };
    carregar();
  }, []);

  const persistir = useCallback(async (novasListas, novoIdAtivo) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          listas: novasListas,
          listaAtivaId: novoIdAtivo,
        })
      );
    } catch (err) {
      console.error('Erro ao salvar listas de compras:', err);
    }
  }, []);

  const atualizarListas = useCallback(
    (updater, novoAtivoId = listaAtivaId) => {
      setListas((prev) => {
        const proximo = typeof updater === 'function' ? updater(prev) : updater;
        const garantido = proximo.length > 0 ? proximo : [criarListaPadrao()];
        const idFinal = garantido.some((l) => l.id === novoAtivoId)
          ? novoAtivoId
          : garantido[0].id;
        setListaAtivaId(idFinal);
        persistir(garantido, idFinal);
        return garantido;
      });
    },
    [listaAtivaId, persistir]
  );

  const listaAtiva = listas.find((l) => l.id === listaAtivaId) || listas[0];

  const selecionarLista = useCallback(
    (id) => {
      setListaAtivaId(id);
      persistir(listas, id);
    },
    [listas, persistir]
  );

  const criarLista = useCallback(
    (nome, itensTemplate = []) => {
      const novaId = gerarId();
      const novaLista = {
        id: novaId,
        nome: nome?.trim() || `Lista ${listas.length + 1}`,
        criadaEm: new Date().toISOString(),
        itens: itensTemplate.map((item) => ({
          id: gerarId(),
          nome: item.nome,
          quantidade: item.quantidade || 1,
          unidade: item.unidade || 'un',
          categoria: item.categoria || inferirCategoria(item.nome),
          marcado: false,
          produtoId: item.produtoId || null,
          precoReferencia: item.precoReferencia || null,
          imagem: item.imagem || null,
        })),
      };
      atualizarListas((prev) => [...prev, novaLista], novaId);
      return novaLista;
    },
    [listas.length, atualizarListas]
  );

  const duplicarLista = useCallback(
    (idOrigem) => {
      const origem = listas.find((l) => l.id === idOrigem);
      if (!origem) return;
      criarLista(
        `${origem.nome} (Cópia)`,
        origem.itens.map((i) => ({ ...i, marcado: false }))
      );
    },
    [listas, criarLista]
  );

  const excluirLista = useCallback(
    (id) => {
      atualizarListas((prev) => prev.filter((l) => l.id !== id));
    },
    [atualizarListas]
  );

  const adicionarItem = useCallback(
    ({ nome, quantidade = 1, unidade = 'un', categoria, produtoId = null, precoReferencia = null, imagem = null }) => {
      const nomeLimpo = nome?.trim();
      if (!nomeLimpo) return;

      atualizarListas((prev) =>
        prev.map((lista) => {
          if (lista.id !== listaAtiva.id) return lista;

          const indiceExistente = lista.itens.findIndex(
            (i) =>
              (produtoId && i.produtoId === produtoId) ||
              i.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
          );

          if (indiceExistente >= 0) {
            const itensAtualizados = [...lista.itens];
            const existente = itensAtualizados[indiceExistente];
            itensAtualizados[indiceExistente] = {
              ...existente,
              quantidade: Number((existente.quantidade + quantidade).toFixed(2)),
              marcado: false,
              produtoId: produtoId || existente.produtoId,
              precoReferencia: precoReferencia ?? existente.precoReferencia,
              imagem: imagem || existente.imagem,
            };
            return { ...lista, itens: itensAtualizados };
          }

          const novoItem = {
            id: gerarId(),
            nome: nomeLimpo,
            quantidade,
            unidade,
            categoria: categoria || inferirCategoria(nomeLimpo),
            marcado: false,
            produtoId,
            precoReferencia,
            imagem,
          };

          return { ...lista, itens: [novoItem, ...lista.itens] };
        })
      );
    },
    [listaAtiva.id, atualizarListas]
  );

  const alternarMarcado = useCallback(
    (itemId) => {
      atualizarListas((prev) =>
        prev.map((lista) => {
          if (lista.id !== listaAtiva.id) return lista;
          return {
            ...lista,
            itens: lista.itens.map((item) =>
              item.id === itemId ? { ...item, marcado: !item.marcado } : item
            ),
          };
        })
      );
    },
    [listaAtiva.id, atualizarListas]
  );

  const atualizarQuantidade = useCallback(
    (itemId, delta) => {
      atualizarListas((prev) =>
        prev.map((lista) => {
          if (lista.id !== listaAtiva.id) return lista;
          return {
            ...lista,
            itens: lista.itens
              .map((item) => {
                if (item.id !== itemId) return item;
                const passo = item.unidade === 'g' || item.unidade === 'ml' ? 100 : 1;
                const novaQtd = Number((item.quantidade + delta * passo).toFixed(2));
                return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
              })
              .filter(Boolean),
          };
        })
      );
    },
    [listaAtiva.id, atualizarListas]
  );

  const removerItem = useCallback(
    (itemId) => {
      atualizarListas((prev) =>
        prev.map((lista) => {
          if (lista.id !== listaAtiva.id) return lista;
          return {
            ...lista,
            itens: lista.itens.filter((item) => item.id !== itemId),
          };
        })
      );
    },
    [listaAtiva.id, atualizarListas]
  );

  const limparMarcados = useCallback(() => {
    atualizarListas((prev) =>
      prev.map((lista) => {
        if (lista.id !== listaAtiva.id) return lista;
        return {
          ...lista,
          itens: lista.itens.filter((item) => !item.marcado),
        };
      })
    );
  }, [listaAtiva.id, atualizarListas]);

  const desmarcarTodos = useCallback(() => {
    atualizarListas((prev) =>
      prev.map((lista) => {
        if (lista.id !== listaAtiva.id) return lista;
        return {
          ...lista,
          itens: lista.itens.map((item) => ({ ...item, marcado: false })),
        };
      })
    );
  }, [listaAtiva.id, atualizarListas]);

  return (
    <ListaComprasContext.Provider
      value={{
        listas,
        listaAtiva,
        carregandoStorage,
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
      }}
    >
      {children}
    </ListaComprasContext.Provider>
  );
}

export const useListaCompras = () => useContext(ListaComprasContext);
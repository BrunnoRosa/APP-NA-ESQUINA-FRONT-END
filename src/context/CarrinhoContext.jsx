import { createContext, useContext, useState } from "react";
import { useToast } from "./ToastContext";

const CarrinhoContext = createContext({});

export function extrairIdMercadinho(produto) {
  if (!produto) return null;
  return (
    produto.idMercadinho ||
    produto.mercadinhoId ||
    produto.id_mercadinho ||
    produto.mercadinho?.idMercadinho ||
    produto.mercadinho?.id ||
    (typeof produto.mercadinho === "number" ? produto.mercadinho : null)
  );
}

export function CarrinhoProvider({ children }) {
  const { confirmar } = useToast();
  const [itens, setItens] = useState([]);
  const [idMercadinho, setIdMercadinho] = useState(null);

  const executarAdicao = (produto, idNovoMercado) => {
    // Tenta obter o ID do novo produto, se nulo mantém o ID global que já estava no carrinho
    const idMercadoExtraido = idNovoMercado || extrairIdMercadinho(produto);
    const idMercadoGarantido = idMercadoExtraido || idMercadinho;

    // Atualiza o idMercadinho global apenas se houver um ID válido
    if (idMercadoGarantido) {
      setIdMercadinho(idMercadoGarantido);
    }

    setItens((itensAtuais) => {
      const idProd = produto.idProduto || produto.id;
      const itemExistente = itensAtuais.find(
        (item) => (item.idProduto || item.id) === idProd,
      );

      const produtoFormatado = {
        ...produto,
        idMercadinho: idMercadoGarantido,
        mercadinhoId: idMercadoGarantido,
        mercadinho:
          typeof produto.mercadinho === "object" && produto.mercadinho !== null
            ? {
                ...produto.mercadinho,
                idMercadinho: idMercadoGarantido,
                id: idMercadoGarantido,
              }
            : { idMercadinho: idMercadoGarantido, id: idMercadoGarantido },
      };

      if (itemExistente) {
        return itensAtuais.map((item) =>
          (item.idProduto || item.id) === idProd
            ? {
                ...item,
                ...produtoFormatado,
                quantidade: item.quantidade + 1,
              }
            : {
                ...item,
                idMercadinho: item.idMercadinho || idMercadoGarantido,
                mercadinhoId: item.mercadinhoId || idMercadoGarantido,
              },
        );
      }

      // Garante que itens anteriores também recebam o idMercadinho caso estivessem sem ele
      const itensAtualizados = itensAtuais.map((item) => ({
        ...item,
        idMercadinho: item.idMercadinho || idMercadoGarantido,
        mercadinhoId: item.mercadinhoId || idMercadoGarantido,
      }));

      return [...itensAtualizados, { ...produtoFormatado, quantidade: 1 }];
    });
  };

  const adicionarAoCarrinho = async (produto) => {
    const idMercadinhoProduto = extrairIdMercadinho(produto);

    if (
      idMercadinho &&
      idMercadinhoProduto &&
      String(idMercadinho) !== String(idMercadinhoProduto) &&
      itens.length > 0
    ) {
      const sim = await confirmar({
        titulo: "Limpar carrinho?",
        mensagem:
          "Seu carrinho contém itens de outro mercadinho. Deseja limpar o carrinho para adicionar este item?",
        textoConfirmar: "Sim, limpar",
        tipo: "perigo",
      });
      if (sim) executarLimpezaEAdicao(produto, idMercadinhoProduto);
      return;
    }

    executarAdicao(produto, idMercadinhoProduto);
  };

  const executarLimpezaEAdicao = (produto, idNovoMercado) => {
    const produtoFormatado = {
      ...produto,
      idMercadinho: idNovoMercado,
      mercadinhoId: idNovoMercado,
      mercadinho: { idMercadinho: idNovoMercado, id: idNovoMercado },
    };
    setItens([{ ...produtoFormatado, quantidade: 1 }]);
    setIdMercadinho(idNovoMercado);
  };

  const removerDoCarrinho = (idProduto) => {
    setItens((itensAtuais) => {
      const novosItens = itensAtuais
        .map((item) => {
          if ((item.idProduto || item.id) === idProduto) {
            return { ...item, quantidade: item.quantidade - 1 };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0);

      if (novosItens.length === 0) {
        setIdMercadinho(null);
      }

      return novosItens;
    });
  };

  const removerItemCompleto = (idProduto) => {
    setItens((itensAtuais) => {
      const novosItens = itensAtuais.filter(
        (item) => (item.idProduto || item.id) !== idProduto,
      );
      if (novosItens.length === 0) {
        setIdMercadinho(null);
      }
      return novosItens;
    });
  };

  const limparCarrinho = () => {
    setItens([]);
    setIdMercadinho(null);
  };

  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  const valorTotal = itens.reduce(
    (acc, item) => acc + (Number(item.preco) || 0) * item.quantidade,
    0,
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        carrinho: itens,
        idMercadinho,
        totalItens,
        valorTotal,
        adicionarAoCarrinho,
        removerDoCarrinho,
        removerItemCompleto,
        limparCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error(
      "useCarrinho deve ser utilizado dentro de um CarrinhoProvider",
    );
  }
  return context;
}

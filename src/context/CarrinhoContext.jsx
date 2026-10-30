import React, { createContext, useState, useContext } from 'react';

const CarrinhoContext = createContext({});

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [idMercadinho, setIdMercadinho] = useState(null);

  const adicionarAoCarrinho = (produto) => {
    // Captura o ID do mercadinho vindo do produto (ajuste a propriedade conforme seu backend: idMercadinho, mercadinhoId, etc.)
    const idMercadinhoProduto = produto.idMercadinho || produto.mercadinhoId || produto.mercadinho?.id;

    // Se o carrinho já tem itens de outro mercadinho, trata a troca de loja
    if (idMercadinho && idMercadinhoProduto && idMercadinho !== idMercadinhoProduto) {
      const confirmarTroca = window.confirm(
        'Seu carrinho contém itens de outro mercadinho. Deseja limpar o carrinho para adicionar este item?'
      );
      if (!confirmarTroca) return;

      // Limpa itens antigos e inicia novo carrinho com o novo mercadinho
      setItens([{ ...produto, quantidade: 1 }]);
      setIdMercadinho(idMercadinhoProduto);
      return;
    }

    // Se for o primeiro item do carrinho
    if (!idMercadinho && idMercadinhoProduto) {
      setIdMercadinho(idMercadinhoProduto);
    }

    setItens((itensAtuais) => {
      const idProd = produto.idProduto || produto.id;
      const itemExistente = itensAtuais.find(
        (item) => (item.idProduto || item.id) === idProd
      );

      if (itemExistente) {
        return itensAtuais.map((item) =>
          (item.idProduto || item.id) === idProd
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...itensAtuais, { ...produto, quantidade: 1 }];
    });
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
      const novosItens = itensAtuais.filter((item) => (item.idProduto || item.id) !== idProduto);
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
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        carrinho: itens,
        idMercadinho, // <--- Agora o idMercadinho é exportado para uso na chamada da API
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
    throw new Error('useCarrinho deve ser utilizado dentro de um CarrinhoProvider');
  }
  return context;
}
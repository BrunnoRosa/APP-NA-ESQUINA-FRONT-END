import React, { createContext, useState, useContext } from 'react';

const CarrinhoContext = createContext({});

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  // Adiciona produto ao carrinho ou incrementa quantidade
  const adicionarAoCarrinho = (produto) => {
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

  // Decrementa quantidade ou remove se chegar a 0
  const removerDoCarrinho = (idProduto) => {
    setItens((itensAtuais) =>
      itensAtuais
        .map((item) => {
          if ((item.idProduto || item.id) === idProduto) {
            return { ...item, quantidade: item.quantidade - 1 };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0)
    );
  };

  // Remove totalmente o item do carrinho
  const removerItemCompleto = (idProduto) => {
    setItens((itensAtuais) =>
      itensAtuais.filter((item) => (item.idProduto || item.id) !== idProduto)
    );
  };

  // Limpa todo o carrinho
  const limparCarrinho = () => {
    setItens([]);
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
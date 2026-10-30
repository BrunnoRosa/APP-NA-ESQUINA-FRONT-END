import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';

export default function ProdutoCard({ produto, onAdicionar, onPress }) {
  const precoFormatado = Number(produto?.preco || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Extrai o ID do mercadinho tratando todas as estruturas possíveis vindas da API/DTO
  const idMercadinho =
    produto?.idMercadinho ||
    produto?.mercadinhoId ||
    produto?.mercadinho?.idMercadinho ||
    produto?.mercadinho?.id;

  // Extrai o nome do mercadinho (suporta objetos aninhados ou propriedades diretas do DTO)
  const nomeMercadinho =
    produto?.nomeMercadinho ||
    produto?.mercadinho?.nome ||
    produto?.mercadinhoNome;

  // Extrai e formata a distância em Km
  const distanciaRaw =
    produto?.distanciaEmKm ??
    produto?.distanciaKm ??
    produto?.distancia ??
    produto?.mercadinho?.distancia;

  const distanciaFormatada =
    typeof distanciaRaw === 'number'
      ? `${distanciaRaw.toFixed(1)} km`
      : null;

  const handleAdicionar = () => {
    if (onAdicionar) {
      // Injeta o idMercadinho garantido dentro do objeto do produto enviado ao carrinho
      onAdicionar({
        ...produto,
        idMercadinho,
      }, idMercadinho);
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {produto?.emDestaque && (
        <View style={styles.destaqueTag}>
          <Text style={styles.destaqueText}>⭐ Destaque</Text>
        </View>
      )}

      <View style={styles.imageContainer}>
        {produto?.imagemUrl ? (
          <Image
            source={{ uri: produto.imagemUrl }}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
          />
        ) : (
          <Text style={styles.imageEmoji}>📦</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nome} numberOfLines={1}>
          {produto?.nome || 'Produto'}
        </Text>

        {/* Linha com Mercadinho e Distância */}
        {(nomeMercadinho || distanciaFormatada) && (
          <View style={styles.storeInfoRow}>
            {nomeMercadinho && (
              <Text style={styles.mercadinhoNome} numberOfLines={1}>
                🏪 {nomeMercadinho}
              </Text>
            )}

            {distanciaFormatada && (
              <Text style={styles.distanciaText}>
                📍 {distanciaFormatada}
              </Text>
            )}
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.preco}>{precoFormatado}</Text>

          {onAdicionar && (
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={handleAdicionar}
              activeOpacity={0.7}
            >
              <Text style={styles.btnAddText}>+ Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
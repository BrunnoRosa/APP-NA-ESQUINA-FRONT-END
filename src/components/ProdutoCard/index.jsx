import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';

export default function ProdutoCard({ produto, onAdicionar, onPress }) {
  const precoFormatado = Number(produto?.preco || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

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

        {produto?.nomeMercadinho && (
          <Text style={styles.mercadinhoNome} numberOfLines={1}>
            🏪 {produto.nomeMercadinho}
          </Text>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.preco}>{precoFormatado}</Text>

          {onAdicionar && (
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => onAdicionar(produto)}
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
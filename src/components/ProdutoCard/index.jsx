import { Ionicons } from '@expo/vector-icons';                  // 🆕
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';                            // 🆕
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
      {/* ✏️ Foto */}
      <View style={styles.imageContainer}>
        {produto?.imagemUrl ? (
          <Image
            source={{ uri: produto.imagemUrl }}
            style={styles.imagem}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="cube" size={30} color={cores.icone} />
        )}
      </View>

      <View style={styles.infoContainer}>
        {/* ✏️ Nome + etiqueta de destaque na mesma linha */}
        <View style={styles.nomeLinha}>
          <Text style={styles.nome} numberOfLines={2}>
            {produto?.nome || 'Produto'}
          </Text>
          {produto?.emDestaque && (
            <View style={styles.destaqueTag}>
              <Ionicons name="star" size={10} color={cores.primaria} />
              <Text style={styles.destaqueText}>Destaque</Text>
            </View>
          )}
        </View>

        {/* ✏️ Mercadinho e distância com ícones */}
        {(nomeMercadinho || distanciaFormatada) && (
          <View style={styles.storeInfoRow}>
            {nomeMercadinho && (
              <View style={styles.infoItem}>
                <Ionicons name="storefront-outline" size={13} color={cores.textoSecundario} />
                <Text style={styles.mercadinhoNome} numberOfLines={1}>
                  {nomeMercadinho}
                </Text>
              </View>
            )}

            {distanciaFormatada && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={13} color={cores.laranjaDistancia} />
                <Text style={styles.distanciaText}>{distanciaFormatada}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.preco}>{precoFormatado}</Text>

          {onAdicionar && (
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={handleAdicionar}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.btnAddText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
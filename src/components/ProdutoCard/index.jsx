import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';
import { styles } from './styles';

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function ProdutoCard({ produto, onAdicionar, onPress }) {
  const precoNormal = Number(produto?.preco || 0);
  const precoPromo = Number(produto?.precoPromocional);

  const temPromocao =
    produto?.emPromocao === true &&
    Number.isFinite(precoPromo) &&
    precoPromo > 0 &&
    precoPromo < precoNormal;

  const percentualDesconto = temPromocao
    ? Math.round(((precoNormal - precoPromo) / precoNormal) * 100)
    : 0;

  // Extrai o ID do mercadinho tratando todas as estruturas possíveis vindas da API/DTO
  const idMercadinho =
    produto?.idMercadinho ||
    produto?.mercadinhoId ||
    produto?.mercadinho?.idMercadinho ||
    produto?.mercadinho?.id;

  // Extrai o nome do mercadinho
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
      onAdicionar(
        {
          ...produto,
          idMercadinho,
        },
        idMercadinho
      );
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
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
        {/* Nome + etiqueta de Oferta ou Destaque */}
        <View style={styles.nomeLinha}>
          <Text style={styles.nome} numberOfLines={2}>
            {produto?.nome || 'Produto'}
          </Text>

          {temPromocao ? (
            <View style={styles.promoTag}>
              <Ionicons name="pricetag" size={10} color="#168A00" />
              <Text style={styles.promoTagText}>Oferta</Text>
            </View>
          ) : produto?.emDestaque ? (
            <View style={styles.destaqueTag}>
              <Ionicons name="star" size={10} color={cores.primaria} />
              <Text style={styles.destaqueText}>Destaque</Text>
            </View>
          ) : null}
        </View>

        {/* Mercadinho e distância */}
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

        {/* Rodapé com preço normal ou De / Por / -% */}
        <View style={styles.footerRow}>
          {temPromocao ? (
            <View style={styles.precoPromoBloco}>
              <Text style={styles.precoAntigo}>{formatarMoeda(precoNormal)}</Text>
              <View style={styles.precoPromoLinha}>
                <Text style={styles.precoPromocional}>{formatarMoeda(precoPromo)}</Text>
                <View style={styles.descontoBadge}>
                  <Text style={styles.descontoTexto}>-{percentualDesconto}%</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.preco}>{formatarMoeda(precoNormal)}</Text>
          )}

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
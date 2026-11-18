import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { estaAberto, obterTextoStatusHoje } from '../../utils/mercado';
import { cores } from '../../theme';
import { styles } from './styles';

export default function MercadoCarrossel({
  mercadinho,
  distanciaKm,
  onPress,
  isFavorito = false,
  onToggleFavorito,
}) {
  const nome = mercadinho?.nomeFantasia || mercadinho?.nome || 'Mercadinho';
  const endereco = mercadinho?.endereco || 'Endereço não informado';
  const aberto = Boolean(estaAberto(mercadinho));
  const textoSelo = obterTextoStatusHoje(mercadinho);

  const valorDistancia =
    distanciaKm ??
    mercadinho?.distanciaEmKm ??
    mercadinho?.distanciaKm ??
    mercadinho?.distancia;

  const distanciaNumero =
    valorDistancia !== null && valorDistancia !== undefined && valorDistancia !== ''
      ? Number(valorDistancia)
      : NaN;

  const distancia = Number.isFinite(distanciaNumero) ? `${distanciaNumero.toFixed(1)} km` : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.foto}>
        {Boolean(onToggleFavorito) && (
          <TouchableOpacity
            style={styles.botaoFavorito}
            activeOpacity={0.7}
            onPress={(e) => {
              if (e && e.stopPropagation) {
                e.stopPropagation();
              }
              onToggleFavorito();
            }}
          >
            <Ionicons
              name={isFavorito ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorito ? cores.primaria || '#E52421' : '#666666'}
            />
          </TouchableOpacity>
        )}

        {mercadinho?.imagemUrl ? (
          <Image source={{ uri: mercadinho.imagemUrl }} style={styles.imagem} />
        ) : (
          <Ionicons name="storefront" size={34} color={cores.primaria || '#E52421'} />
        )}

        <View style={[styles.selo, !aberto && styles.seloFechado]}>
          <Text style={styles.seloTexto}>{String(textoSelo)}</Text>
        </View>
      </View>

      <Text style={styles.nome} numberOfLines={1}>
        {String(nome)}
      </Text>

      <View style={styles.linhaInfo}>
        <Ionicons name="location-outline" size={13} color={cores.textoSecundario || '#666666'} />
        <Text style={[styles.endereco, { flex: 1 }]} numberOfLines={1}>
          {String(endereco)}
        </Text>
      </View>

      {distancia ? (
        <View style={[styles.linhaInfo, { marginTop: 2 }]}>
          <Ionicons
            name="location-outline"
            size={13}
            color={cores.laranjaDistancia || '#F59E0B'}
          />
          <Text
            style={[
              styles.distancia,
              {
                color: cores.laranjaDistancia || '#F59E0B',
                fontWeight: '700',
                marginLeft: 2,
              },
            ]}
          >
            {String(distancia)}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
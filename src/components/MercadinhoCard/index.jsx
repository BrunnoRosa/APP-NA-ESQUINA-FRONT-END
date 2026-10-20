import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';

export default function MercadinhoCard({ mercadinho, onPress }) {
  const nome = mercadinho?.nomeFantasia || mercadinho?.nome || 'Mercadinho da Esquina';
  const endereco = mercadinho?.endereco || 'Bairro local';
  const distancia = mercadinho?.distanciaKm ? `${mercadinho.distanciaKm.toFixed(1)} km` : '0.8 km';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.imagePlaceholder}>
        {mercadinho?.imagemUrl ? (
          <Image
            source={{ uri: mercadinho.imagemUrl }}
            style={{ width: '100%', height: '100%', borderRadius: 10 }}
          />
        ) : (
          <Text style={styles.imageText}>🏪</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nome} numberOfLines={1}>
            {nome}
          </Text>
          <View style={styles.badgeAberto}>
            <Text style={styles.badgeText}>Aberto</Text>
          </View>
        </View>

        <Text style={styles.endereco} numberOfLines={1}>
          📍 {endereco}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.metaItem}>
            <Text style={{ fontSize: 12 }}>⭐</Text>
            <Text style={styles.metaText}>4.8</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={{ fontSize: 12 }}>🛵</Text>
            <Text style={styles.metaText}>{distancia}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={{ fontSize: 12 }}>⏱️</Text>
            <Text style={styles.metaText}>15-25 min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
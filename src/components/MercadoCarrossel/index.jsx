import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { estaAberto, formatarHora } from '../../utils/mercado';
import { cores } from '../../theme';
import { styles } from './styles';

export default function MercadoCarrossel({ 
  mercadinho, 
  onPress, 
  isFavorito = false, 
  onToggleFavorito 
}) {
  const nome = mercadinho?.nomeFantasia || mercadinho?.nome || 'Mercadinho';
  const endereco = mercadinho?.endereco || 'Endereço não informado';
  const aberto = Boolean(estaAberto(mercadinho?.horarioAbertura, mercadinho?.horarioFechamento));
  const fecha = formatarHora(mercadinho?.horarioFechamento);

  // Garante que o selo exiba texto simples sem causar nós de texto inválidos
  const textoSelo = aberto ? (fecha ? `Aberto até às ${fecha}` : 'Aberto') : 'Fechado';

  const distancia =
    typeof mercadinho?.distanciaKm === 'number'
      ? `${mercadinho.distanciaKm.toFixed(1)} km`
      : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.foto}>
        {/* Botão de Favoritar */}
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

        {/* Selo de Status Blindado */}
        <View style={[styles.selo, !aberto && styles.seloFechado]}>
          <Text style={styles.seloTexto}>{String(textoSelo)}</Text>
        </View>
      </View>

      <Text style={styles.nome} numberOfLines={1}>
        {String(nome)}
      </Text>

      <View style={styles.linhaInfo}>
        <Ionicons name="location-outline" size={13} color={cores.textoSecundario || '#666666'} />
        <Text style={styles.endereco} numberOfLines={1}>
          {String(endereco)}
        </Text>
      </View>

      {distancia ? (
        <Text style={styles.distancia}>{String(distancia)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
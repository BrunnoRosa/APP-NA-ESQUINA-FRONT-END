import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';
import { styles } from './styles';

export default function MercadoCarrossel({ mercadinho, onPress }) {
  const nome = mercadinho?.nomeFantasia || mercadinho?.nome || 'Mercadinho';
  const endereco = mercadinho?.endereco || 'Endereço não informado';
  // Só mostra a distância se o backend tiver mandado
  const distancia =
    typeof mercadinho?.distanciaKm === 'number'
      ? `${mercadinho.distanciaKm.toFixed(1)} km`
      : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.foto}>
        {mercadinho?.imagemUrl ? (
          <Image source={{ uri: mercadinho.imagemUrl }} style={styles.imagem} />
        ) : (
          <Ionicons name="storefront" size={34} color={cores.primaria} />
        )}
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>Aberto</Text>
        </View>
      </View>

      <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
      <View style={styles.linhaInfo}>
        <Ionicons name="location-outline" size={13} color={cores.textoSecundario} />
        <Text style={styles.endereco} numberOfLines={1}>{endereco}</Text>
      </View>
      {distancia && <Text style={styles.distancia}>{distancia}</Text>}
    </TouchableOpacity>
  );
}
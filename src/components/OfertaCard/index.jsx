import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';
import { styles } from './styles';

export default function OfertaCard({ produto, onAdicionar }) {
  const preco = Number(produto?.preco || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const nomeMercadinho =
    produto?.nomeMercadinho || produto?.mercadinho?.nome || produto?.mercadinhoNome;

  return (
    <View style={styles.card}>
      <View style={styles.foto}>
        {produto?.imagemUrl ? (
          <Image source={{ uri: produto.imagemUrl }} style={styles.imagem} resizeMode="contain" />
        ) : (
          <Ionicons name="cube" size={34} color={cores.icone} />
        )}
      </View>

      <Text style={styles.nome} numberOfLines={2}>{produto?.nome || 'Produto'}</Text>
      {nomeMercadinho && (
        <Text style={styles.mercadinho} numberOfLines={1}>{nomeMercadinho}</Text>
      )}

      <View style={styles.rodape}>
        <Text style={styles.preco}>{preco}</Text>
        <TouchableOpacity style={styles.botaoAdd} onPress={onAdicionar} activeOpacity={0.7}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
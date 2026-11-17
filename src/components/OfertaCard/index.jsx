import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';
import { styles } from './styles';

export default function OfertaCard({ produto, onPress, onAdicionar }) {
  const valorFormatado = Number(produto?.preco || 0)
    .toFixed(2)
    .replace('.', ',');

  const nomeMercadinho =
    produto?.nomeMercadinho || produto?.mercadinho?.nome || produto?.mercadinhoNome;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.foto}>
        <View style={styles.seloDestaque}>
          <Ionicons name="flame" size={11} color="#B45309" />
          <Text style={styles.seloDestaqueTexto}>Destaque</Text>
        </View>

        {produto?.imagemUrl ? (
          <Image
            source={{ uri: produto.imagemUrl }}
            style={styles.imagem}
            resizeMode="contain"
          />
        ) : (
          <Ionicons name="cube" size={34} color={cores.icone} />
        )}
      </View>

      <Text style={styles.nome} numberOfLines={2}>
        {produto?.nome || 'Produto'}
      </Text>

      {nomeMercadinho ? (
        <View style={styles.lojaLinha}>
          <Ionicons
            name="storefront-outline"
            size={11}
            color={cores.textoSecundario}
          />
          <Text style={styles.mercadinho} numberOfLines={1}>
            {nomeMercadinho}
          </Text>
        </View>
      ) : null}

      <View style={styles.rodape}>
        <View style={styles.precoBloco}>
          <Text style={styles.porApenas}>por apenas</Text>
          <View style={styles.precoLinha}>
            <Text style={styles.cifrao}>R$</Text>
            <Text style={styles.valor}>{valorFormatado}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.botaoAdd}
          onPress={(e) => {
            e?.stopPropagation?.();
            onAdicionar?.();
          }}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
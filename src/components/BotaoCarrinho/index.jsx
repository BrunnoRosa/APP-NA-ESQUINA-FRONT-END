import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCarrinho } from '../../context/CarrinhoContext';
import { styles } from './styles';

// bottom: distância da borda de baixo. A Home tem barra de abas (90);
// telas sem abas (Detalhes) usam um valor menor (30, o padrão).
export default function BotaoCarrinho({ navigation, bottom = 30 }) {
  const { totalItens } = useCarrinho();

  // Sem itens, o botão nem aparece
  if (!totalItens || totalItens <= 0) return null;

  return (
    <TouchableOpacity
      style={[styles.botao, { bottom }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Carrinho')}
    >
      <Ionicons name="cart" size={26} color="#FFFFFF" />
      <View style={styles.badge}>
        <Text style={styles.badgeTexto}>{totalItens}</Text>
      </View>
    </TouchableOpacity>
  );
}
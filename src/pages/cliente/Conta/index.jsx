import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useCarrinho } from '../../../context/CarrinhoContext';
import { cores } from '../../../theme';
import { styles } from './styles';

// Uma linha do menu: ícone + texto + seta (+ selo opcional)
function ItemMenu({ icone, texto, aoPressionar, selo }) {
  return (
    <TouchableOpacity style={styles.item} onPress={aoPressionar} activeOpacity={0.8}>
      <View style={styles.itemIcone}>
        <Ionicons name={icone} size={20} color={cores.primaria} />
      </View>
      <Text style={styles.itemTexto}>{texto}</Text>
      {selo > 0 && (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>{selo}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={cores.textoSecundario} />
    </TouchableOpacity>
  );
}

export default function Conta({ navigation }) {
  const { user, signOut } = useAuth();
  const { totalItens } = useCarrinho();
  const [sobreVisivel, setSobreVisivel] = useState(false);

  const nome = user?.nome || 'Cliente';
  const inicial = nome.trim().charAt(0).toUpperCase();

  // Pergunta antes de sair (web usa confirm; celular usa Alert)
  function confirmarSaida() {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente sair da sua conta?')) signOut();
      return;
    }
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.avatar}>
          {inicial ? (
            <Text style={styles.avatarLetra}>{inicial}</Text>
          ) : (
            <Ionicons name="person" size={40} color={cores.primaria} />
          )}
        </View>
        <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
        <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.folha}>
        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          <Text style={styles.secao}>Minha conta</Text>
          <View style={styles.cartao}>
            <ItemMenu
              icone="create-outline"
              texto="Editar perfil"
              aoPressionar={() => navigation.navigate('EditarPerfil')}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="receipt-outline"
              texto="Meus pedidos"
              aoPressionar={() => navigation.navigate('MeusPedidos')}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="heart-outline"
              texto="Favoritos"
              aoPressionar={() => navigation.navigate('Favoritos')}
            />
            <View style={styles.divisor} />
            <ItemMenu
              icone="cart-outline"
              texto="Meu carrinho"
              selo={totalItens}
              aoPressionar={() => navigation.navigate('Carrinho')}
            />
          </View>

          <Text style={styles.secao}>Ajuda</Text>
          <View style={styles.cartao}>
            <ItemMenu
              icone="information-circle-outline"
              texto="Sobre o Na Esquina"
              aoPressionar={() => setSobreVisivel(true)}
            />
          </View>

          <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.botaoSairTexto}>Sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal "Sobre" */}
      <Modal
        visible={sobreVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setSobreVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <View style={styles.modalIcone}>
              <Ionicons name="storefront-outline" size={32} color={cores.primaria} />
            </View>
            <Text style={styles.modalTitulo}>Na Esquina</Text>
            <Text style={styles.modalTexto}>
              Aplicativo que aproxima você dos mercadinhos do seu bairro: encontre produtos,
              monte seu carrinho e retire seu pedido na loja.
            </Text>
            <Text style={styles.modalRodape}>Projeto de TCC • SENAI Dendezeiros</Text>
            <TouchableOpacity
              style={styles.modalBotao}
              onPress={() => setSobreVisivel(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBotaoTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
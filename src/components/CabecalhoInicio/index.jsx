import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cores } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { styles } from './styles';

export default function CabecalhoInicio({ navigation }) {
  const { user } = useAuth();

  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'visitante';

  return (
    <LinearGradient
      colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
      style={styles.container}
    >
      {/* Endereço (por enquanto só visual) */}
      <View style={styles.linhaEndereco}>
        <Text style={styles.endereco}>Av. Dendezeiros do Bonfim, 99</Text>
        <Ionicons name="chevron-down" size={14} color={cores.textoEndereco} />
      </View>

      {/* Saudação + logo */}
      <View style={styles.linhaSaudacao}>
        <Text style={styles.saudacao}>Olá, {primeiroNome}</Text>
        <Image
          source={require('../../../assets/images/logo-na-esquina.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Busca + filtro */}
      <View style={styles.linhaBusca}>
        <View style={styles.campoBusca}>
          <TextInput
            style={styles.inputBusca}
            placeholder="Pesquisar"
            placeholderTextColor={cores.textoSecundario}
            onFocus={() => navigation.navigate('BuscarProdutos')}
          />
          <TouchableOpacity 
            style={styles.botaoFiltro}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Botão de Favoritos funcional */}
        <TouchableOpacity 
          style={[styles.botaoRedondo, styles.botaoCoracao]}
          onPress={() => navigation.navigate('Favoritos')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Botão de Notificações */}
        <TouchableOpacity 
          style={[styles.botaoRedondo, styles.botaoSino]}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={cores.textoTitulo} />
          <View style={styles.pontoAviso} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocalizacao } from '../../context/LocalizacaoContext';
import { cores } from '../../theme';
import { styles } from './styles';

export default function CabecalhoInicio({ navigation }) {
  const { user } = useAuth();
  const { endereco, carregando } = useLocalizacao();
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(true);

  const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'visitante';

  const handleAbrirNotificacoes = () => {
    setTemNotificacaoNaoLida(false);
    try {
      navigation.navigate('Notificacoes');
    } catch (e) {
      console.log('Rota Notificacoes não encontrada:', e);
    }
  };

  return (
    <LinearGradient
      colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
      style={styles.container}
    >
      {/* Endereço atual (GPS ou o que o cliente digitou) */}
      <View style={styles.linhaEndereco}>
        <Text style={styles.endereco} numberOfLines={1}>
          {endereco || (carregando ? 'Buscando sua localização...' : 'Informe seu endereço')}
        </Text>
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

        {/* Botão de Notificações ativado */}
        <TouchableOpacity 
          style={[styles.botaoRedondo, styles.botaoSino]}
          onPress={handleAbrirNotificacoes}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={cores.textoTitulo} />
          {temNotificacaoNaoLida && <View style={styles.pontoAviso} />}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
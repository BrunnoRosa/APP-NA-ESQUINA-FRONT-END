import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { styles } from './styles';

export default function Abertura({ navigation }) {
  const {width, height} = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/fundo-abertura.jpg')}
       // style={styles.fotoFundo}
        style={{ width: '100%', height: '100%', position: 'absolute' }} // Ajusta a largura e altura da imagem para preencher a tela
        resizeMode="cover"
      />
      <View style={styles.camadaLaranja} />

      <View style={styles.areaLogo}>
        <Image
          source={require('../../../../assets/images/logo-na-esquina.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Na Esquina"
        />
      </View>

      <View style={styles.cartao}>
        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.textoBotaoPrincipal}>Já possuo uma conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => navigation.navigate('Cadastro')}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.textoBotaoSecundario}>Criar nova conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
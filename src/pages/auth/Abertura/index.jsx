import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';

export default function Abertura({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/fundo-abertura.jpg')}
        style={styles.fotoFundo}
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
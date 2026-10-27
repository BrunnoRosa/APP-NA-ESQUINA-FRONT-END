import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; // Ícones nativos do Expo
import { styles } from './styles';

export default function Abertura({ navigation }) {
  const [etapa, setEtapa] = useState(1);

  const fadeTexto = useRef(new Animated.Value(0)).current;
  const fadeTelaFinal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Etapa 2: Revela o slogan após 1.5s
    const timer1 = setTimeout(() => {
      setEtapa(2);
      Animated.timing(fadeTexto, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // Etapa 3: Transita para a tela final (Foto + Cartão) após 4.5s
    const timer2 = setTimeout(() => {
      setEtapa(3);
      Animated.timing(fadeTelaFinal, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- TELA FINAL (Etapa 3) ---
  if (etapa === 3) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../../../assets/images/fundo-abertura.jpg')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <View style={styles.camadaOverlay} />

        <Animated.View style={[styles.containerFinal, { opacity: fadeTelaFinal }]}>
          <View style={styles.areaLogoFinal}>
            <Image
              source={require('../../../../assets/images/logo-na-esquina.png')}
              style={styles.logoFinal}
              resizeMode="contain"
            />
          </View>

          <View style={styles.cartao}>
            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoPrincipal}>Já possuo uma conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoSecundario}
              onPress={() => navigation.navigate('Cadastro')}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoSecundario}>Criar nova conta</Text>
            </TouchableOpacity>

            <View style={styles.areaAcessarCom}>
              <View style={styles.linhaDivisora} />
              <Text style={styles.textoAcessarCom}>Acessar com</Text>
              <View style={styles.linhaDivisora} />
            </View>

            {/* Ícones de Redes Sociais usando Vetores Nativos */}
            <View style={styles.areaSociais}>
              <TouchableOpacity style={styles.botaoSocial}>
                <FontAwesome name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSocial}>
                <FontAwesome name="apple" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSocial}>
                <FontAwesome name="facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  // --- TELAS DE ABERTURA / SPLASH (Etapas 1 e 2) ---
  return (
    <LinearGradient
      colors={['#FFDF6D', '#F9C043', '#F3A835']}
      style={styles.containerSplash}
    >
      <View style={styles.areaConteudoSplash}>
        <Image
          source={require('../../../../assets/images/logo-na-esquina.png')}
          style={styles.logoSplash}
          resizeMode="contain"
        />

        {etapa >= 2 && (
          <Animated.View style={[styles.areaTexto, { opacity: fadeTexto }]}>
            <Text style={styles.textoSlogan}>
              Seu mercadinho na palma da mão:
            </Text>
            <Text style={styles.textoDestaque}>
              rápido, prático e perto de você.
            </Text>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  );
}
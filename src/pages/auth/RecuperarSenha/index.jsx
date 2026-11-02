import { Ionicons } from '@expo/vector-icons';                  // 🆕
import { LinearGradient } from 'expo-linear-gradient';          // 🆕
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,                                                         // 🆕
  KeyboardAvoidingView,
  Platform,
  ScrollView,                                                    // 🆕
  Text,
  TextInput,
  TouchableOpacity,
  View,                                                          // 🆕
} from 'react-native';
import api from '../../../services/api';
import { cores } from '../../../theme';                         // 🆕
import { traduzirErro, validarEmail } from '../../../utils/validacoes';
import { styles } from './styles';

export default function RecuperarSenha({ navigation }) {
  const [email, setEmail] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);
  const [erroEmail, setErroEmail] = useState('');

  async function handleRecuperar() {
    // Valida o formato do e-mail antes de chamar o servidor
    const mensagem = validarEmail(email);
    setErroEmail(mensagem);
    if (mensagem) {
      return;
    }

    setLoadingReq(true);
    try {
      // Endpoint no Spring Boot responsável por enviar o e-mail de recuperação
      await api.post('/api/auth/recuperar-senha', { email: email.trim().toLowerCase() });

      Alert.alert(
        'Sucesso',
        'Se o e-mail estiver cadastrado, receberá as instruções para redefinir a sua senha.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      // 404 = o back-end ainda não tem esta rota (recuperação de senha está pendente no back)
      if (error.response && error.response.status === 404) {
        Alert.alert('Indisponível', 'A recuperação de senha ainda não está disponível. Fale com a equipe do Na Esquina.');
      } else {
        const erro = traduzirErro(error);
        Alert.alert(erro.titulo, erro.mensagem);
      }
    } finally {
      setLoadingReq(false);
    }
  }

  // ✏️ Visual novo a partir daqui
  return (
    <LinearGradient
      colors={[cores.degradeTopo, cores.degradeBase]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../../../assets/images/logo-na-esquina.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Na Esquina"
          />

          <View style={styles.cartao}>
            <Text style={styles.titulo}>Recuperar senha</Text>
            <Text style={styles.subtitulo}>
              Digite o seu e-mail para receber um link de redefinição de senha.
            </Text>

            <Text style={styles.rotulo}>Email</Text>
            <TextInput
              style={[styles.campo, erroEmail ? styles.campoErro : null]}
              placeholder="Digite seu e-mail"
              placeholderTextColor={cores.icone}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              maxLength={150}
              onChangeText={(texto) => {
                setEmail(texto);
                if (erroEmail) setErroEmail('');
              }}
            />
            {erroEmail ? <Text style={styles.textoErro}>{erroEmail}</Text> : null}

            <TouchableOpacity
              style={styles.botao}
              onPress={handleRecuperar}
              disabled={loadingReq}
              activeOpacity={0.85}
            >
              {loadingReq ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>Enviar instruções</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.linkVoltar}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color={cores.textoLogin} />
              <Text style={styles.linkVoltarTexto}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../../services/api';
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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.subtitle}>
        Digite o seu e-mail para receber um link de redefinição de senha.
      </Text>

      <TextInput
        style={[styles.input, erroEmail ? styles.inputErro : null]}
        placeholder="O seu e-mail"
        placeholderTextColor="#999"
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
        style={styles.button} 
        onPress={handleRecuperar} 
        disabled={loadingReq}
      >
        {loadingReq ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Enviar Instruções</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
        <Text style={styles.linkText}>← Voltar para o Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
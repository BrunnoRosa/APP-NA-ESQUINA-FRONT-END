import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../../services/api';
import { styles } from './styles';

export default function RecuperarSenha({ navigation }) {
  const [email, setEmail] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);

  async function handleRecuperar() {
    if (!email) {
      Alert.alert('Atenção', 'Por favor, insira o seu e-mail.');
      return;
    }

    setLoadingReq(true);
    try {
      // Endpoint no Spring Boot responsável por enviar o e-mail de recuperação
      await api.post('/api/auth/recuperar-senha', { email });

      Alert.alert(
        'Sucesso',
        'Se o e-mail estiver cadastrado, receberá as instruções para redefinir a sua senha.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o pedido. Verifique a sua conexão ou tente novamente mais tarde.');
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
        style={styles.input}
        placeholder="O seu e-mail"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

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
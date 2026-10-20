import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { styles } from './styles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);

  const { login } = useAuth();

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function handleLogin() {
    if (!email || !senha) {
      exibirAlerta('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoadingReq(true);
    try {
      await login(email, senha);
    } catch (error) {
      console.log('Erro do Login:', error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          const mensagens = typeof data === 'string' ? data : Object.values(data).join('\n');
          exibirAlerta('Erro de Validação', mensagens);
        } else if (status === 401) {
          exibirAlerta('Acesso Negado', 'E-mail ou senha incorretos.');
        } else if (status === 404) {
          exibirAlerta('Erro 404', 'Endpoint de login não encontrado.');
        } else {
          exibirAlerta('Erro', 'Ocorreu um erro no servidor.');
        }
      } else {
        exibirAlerta(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor. Verifique se o Back-end está ativo.'
        );
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
      <Text style={styles.title}>Na Esquina</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="O seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="A sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Botão Principal de Login */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loadingReq}
      >
        {loadingReq ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      {/* Link para Tela de Cadastro */}
      <TouchableOpacity
        style={{ marginTop: 20, alignItems: 'center' }}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={{ color: '#007BFF', fontSize: 14 }}>
          Ainda não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
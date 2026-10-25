import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { cores } from '../../../theme';
import { styles } from './styles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
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
        await login(email, senha, lembrar);
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
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/fundo-abertura.jpg')}
        style={styles.fotoFundo}
        resizeMode="cover"
      />
      <View style={styles.camadaLaranja} />

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
            <View style={styles.topico}>
              <Text style={styles.topicoTexto}>Login</Text>
            </View>

            <Text style={styles.rotulo}>Email</Text>
            <TextInput
              style={styles.campo}
              placeholder="Digite seu e-mail"
              placeholderTextColor={cores.icone}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.rotulo}>Senha</Text>
            <View style={styles.campoSenha}>
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                accessibilityRole="button"
                accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.linhaOpcoes}>
              <TouchableOpacity
                style={styles.lembrar}
                onPress={() => setLembrar(!lembrar)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: lembrar }}
              >
                <Ionicons
                  name={lembrar ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={lembrar ? cores.primaria : cores.icone}
                />
                <Text style={styles.textoOpcao}>Salvar acesso</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('RecuperarSenha')}>
                <Text style={styles.linkVermelho}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.botao}
              onPress={handleLogin}
              disabled={loadingReq}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {loadingReq ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.rodape}>
              <Text style={styles.textoOpcao}>Não possui uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.linkVermelho}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
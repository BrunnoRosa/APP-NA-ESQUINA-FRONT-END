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
import { traduzirErro, validarEmail, validarSenhaLogin } from '../../../utils/validacoes';
import { styles } from './styles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  // Mensagens de erro de cada campo: { email: '...', senha: '...' }. Vazio = campo OK.
  const [erros, setErros] = useState({});

  const { login } = useAuth();

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function handleLogin() {
    // 1) Valida no próprio app, antes de gastar uma chamada ao servidor
    const novosErros = {
      email: validarEmail(email),
      senha: validarSenhaLogin(senha),
    };
    setErros(novosErros);
    if (novosErros.email || novosErros.senha) {
      return; // as mensagens aparecem embaixo dos campos
    }

    setLoadingReq(true);
    try {
        await login(email.trim().toLowerCase(), senha, lembrar);
    } catch (error) {
      console.log('Erro do Login:', error);

      // traduzirErro() entende todos os tipos de falha (401, 400, 500, sem internet...)
      const erro = traduzirErro(error);

      if (error.response && error.response.status === 400 && Object.keys(erro.campos).length > 0) {
        // O back apontou campos específicos: mostra embaixo de cada um
        setErros({ email: erro.campos.email || '', senha: erro.campos.senha || '' });
      } else {
        exibirAlerta(erro.titulo, erro.mensagem);
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
              style={[styles.campo, erros.email ? styles.campoErro : null]}
              placeholder="Digite seu e-mail"
              placeholderTextColor={cores.icone}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              maxLength={150}
              onChangeText={(texto) => {
                setEmail(texto);
                if (erros.email) setErros({ ...erros, email: '' }); // some o erro assim que a pessoa corrige
              }}
              onBlur={() => setErros({ ...erros, email: email ? validarEmail(email) : '' })}
            />
            {erros.email ? <Text style={styles.textoErro}>{erros.email}</Text> : null}

            <Text style={styles.rotulo}>Senha</Text>
            <View style={[styles.campoSenha, erros.senha ? styles.campoErro : null]}>
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                value={senha}
                onChangeText={(texto) => {
                  setSenha(texto);
                  if (erros.senha) setErros({ ...erros, senha: '' });
                }}
                onSubmitEditing={handleLogin}
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
            {erros.senha ? <Text style={styles.textoErro}>{erros.senha}</Text> : null}

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
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../services/api';
import { styles } from './styles';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('CLIENTE'); // Padrão
  const [loading, setLoading] = useState(false);

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function handleCadastro() {
  if (!nome || !email || !senha || !telefone) {
    exibirAlerta('Campos Obrigatórios', 'Por favor, preencha todos os campos do formulário.');
    return;
  }

  setLoading(true);
  try {
    await api.post('/api/auth/register', {
      nome,
      email,
      senha,
      telefone,
      perfil,
    });

    exibirAlerta('Sucesso!', 'Conta criada com sucesso. Faça login para continuar.');
    navigation.navigate('Login');
  } catch (error) {
    console.log('Erro no cadastro:', error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      let mensagem = 'Erro ao realizar cadastro. Verifique os dados.';

      if (typeof data === 'string') {
        mensagem = data;
      } else if (data.message) {
        mensagem = data.message;
      } else if (typeof data === 'object') {
        mensagem = Object.values(data).join('\n');
      }

      if (status === 403) {
        exibirAlerta('Acesso Negado (403)', 'A rota de cadastro precisa ser liberada no SecurityConfig.');
      } else {
        exibirAlerta('Erro no Cadastro', mensagem);
      }
    } else {
      exibirAlerta('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Na Esquina</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone / WhatsApp"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Text style={styles.label}>Tipo de Perfil:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, perfil === 'CLIENTE' && styles.roleButtonSelected]}
            onPress={() => setPerfil('CLIENTE')}
          >
            <Text style={[styles.roleText, perfil === 'CLIENTE' && styles.roleTextSelected]}>
              Cliente / Morador
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, perfil === 'COMERCIANTE' && styles.roleButtonSelected]}
            onPress={() => setPerfil('COMERCIANTE')}
          >
            <Text style={[styles.roleText, perfil === 'COMERCIANTE' && styles.roleTextSelected]}>
              Comerciante
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Já tem uma conta? Voltar ao Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
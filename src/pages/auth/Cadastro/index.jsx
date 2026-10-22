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
  // Estados do Usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('CLIENTE'); 
  const [loading, setLoading] = useState(false);

  // Estados do Mercadinho (só usados se perfil for COMERCIANTE)
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [horarioAbertura, setHorarioAbertura] = useState('');
  const [horarioFechamento, setHorarioFechamento] = useState('');

  function exibirAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  async function handleCadastro() {
    if (!nome || !email || !senha || !telefone) {
      exibirAlerta('Campos Obrigatórios', 'Por favor, preencha todos os campos básicos.');
      return;
    }

    if (perfil === 'COMERCIANTE' && (!nomeFantasia || !cnpj || !endereco)) {
      exibirAlerta('Campos Obrigatórios', 'Preencha os dados do mercadinho.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cria o Usuário primeiro
      const userResponse = await api.post('/api/auth/register', {
        nome,
        email,
        senha,
        telefone,
        perfil,
      });

      // 2. Se for comerciante, cria o Mercadinho em seguida
      if (perfil === 'COMERCIANTE') {
        // Obtenha o ID do usuário criado (depende de como seu backend retorna isso no /register)
        const idComerciante = userResponse.data.id; 

        // Faz a requisição usando a rota correta do seu backend para salvar o mercadinho
        await api.post('/api/mercadinhos', {
          nomeFantasia,
          cnpj,
          endereco,
          // Convertendo para números de exemplo (ajuste conforme usar mapa/GPS)
          latitude: -12.9714, 
          longitude: -38.5014,
          // Formato esperado pelo LocalTime no Java (HH:mm:ss)
          horarioAbertura: horarioAbertura + ":00", 
          horarioFechamento: horarioFechamento + ":00",
          idComerciante: idComerciante 
        });
      }

      exibirAlerta('Sucesso!', 'Conta criada com sucesso. Faça login para continuar.');
      navigation.navigate('Login');
    } catch (error) {
      console.log('Erro no cadastro:', error);
      // ... restante do seu tratamento de erro original mantido ...
      exibirAlerta('Erro', 'Falha ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Na Esquina</Text>

        <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Telefone / WhatsApp" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} />
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />

        <Text style={styles.label}>Tipo de Perfil:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, perfil === 'CLIENTE' && styles.roleButtonSelected]} onPress={() => setPerfil('CLIENTE')}>
            <Text style={[styles.roleText, perfil === 'CLIENTE' && styles.roleTextSelected]}>Cliente / Morador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, perfil === 'COMERCIANTE' && styles.roleButtonSelected]} onPress={() => setPerfil('COMERCIANTE')}>
            <Text style={[styles.roleText, perfil === 'COMERCIANTE' && styles.roleTextSelected]}>Comerciante</Text>
          </TouchableOpacity>
        </View>

        {/* --- RENDERIZAÇÃO CONDICIONAL DOS CAMPOS DO MERCADINHO --- */}
        {perfil === 'COMERCIANTE' && (
          <View style={{ marginTop: 15, marginBottom: 15 }}>
            <Text style={styles.label}>Dados do Mercadinho:</Text>
            <TextInput style={styles.input} placeholder="Nome Fantasia" value={nomeFantasia} onChangeText={setNomeFantasia} />
            <TextInput style={styles.input} placeholder="CNPJ" keyboardType="numeric" value={cnpj} onChangeText={setCnpj} />
            <TextInput style={styles.input} placeholder="Endereço Completo" value={endereco} onChangeText={setEndereco} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="Abre às (Ex: 08:00)" value={horarioAbertura} onChangeText={setHorarioAbertura} />
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="Fecha às (Ex: 20:00)" value={horarioFechamento} onChangeText={setHorarioFechamento} />
            </View>
          </View>
        )}
        {/* --------------------------------------------------------- */}

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backButtonText}>Já tem uma conta? Voltar ao Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
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
import api from '../../../services/api';
import { cores } from '../../../theme';
import { styles } from './styles';

// Campo reutilizável: rótulo em cima + caixa de texto.
// "estiloExterno" permite ajustar a largura quando dois campos ficam lado a lado.
function Campo({ rotulo, estiloExterno, ...props }) {
  return (
    <View style={estiloExterno}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput style={styles.campo} placeholderTextColor={cores.icone} {...props} />
    </View>
  );
}

export default function Cadastro({ navigation }) {
  // Estados do Usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
            {/* Seletor de perfil */}
            <View style={styles.seletor}>
              <TouchableOpacity
                style={[styles.opcao, perfil === 'CLIENTE' && styles.opcaoAtiva]}
                onPress={() => setPerfil('CLIENTE')}
                accessibilityRole="button"
                accessibilityState={{ selected: perfil === 'CLIENTE' }}
              >
                <Text style={[styles.opcaoTexto, perfil === 'CLIENTE' && styles.opcaoTextoAtivo]}>
                  Cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.opcao, perfil === 'COMERCIANTE' && styles.opcaoAtiva]}
                onPress={() => setPerfil('COMERCIANTE')}
                accessibilityRole="button"
                accessibilityState={{ selected: perfil === 'COMERCIANTE' }}
              >
                <Text style={[styles.opcaoTexto, perfil === 'COMERCIANTE' && styles.opcaoTextoAtivo]}>
                  Dono do comércio
                </Text>
              </TouchableOpacity>
            </View>

            <Campo rotulo="Nome completo" placeholder="Digite seu nome" value={nome} onChangeText={setNome} />
            <Campo
              rotulo="Email"
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <Campo
              rotulo="Telefone / WhatsApp"
              placeholder="Digite seu telefone"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
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

            {/* --- CAMPOS DO MERCADINHO (só para Dono do comércio) --- */}
            {perfil === 'COMERCIANTE' && (
              <View>
                <Text style={styles.subtitulo}>Dados do mercadinho</Text>
                <Campo
                  rotulo="Nome fantasia"
                  placeholder="Nome do mercadinho"
                  value={nomeFantasia}
                  onChangeText={setNomeFantasia}
                />
                <Campo
                  rotulo="CNPJ"
                  placeholder="Somente números"
                  keyboardType="numeric"
                  value={cnpj}
                  onChangeText={setCnpj}
                />
                <Campo
                  rotulo="Endereço completo"
                  placeholder="Rua, número, bairro"
                  value={endereco}
                  onChangeText={setEndereco}
                />
                <View style={styles.linhaHorarios}>
                  <Campo
                    estiloExterno={{ flex: 1 }}
                    rotulo="Abre às"
                    placeholder="08:00"
                    value={horarioAbertura}
                    onChangeText={setHorarioAbertura}
                  />
                  <Campo
                    estiloExterno={{ flex: 1 }}
                    rotulo="Fecha às"
                    placeholder="20:00"
                    value={horarioFechamento}
                    onChangeText={setHorarioFechamento}
                  />
                </View>
              </View>
            )}
            {/* ------------------------------------------------------ */}

            <TouchableOpacity
              style={styles.botao}
              onPress={handleCadastro}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.rodape}>
              <Text style={styles.textoRodape}>Já possui uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkVermelho}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
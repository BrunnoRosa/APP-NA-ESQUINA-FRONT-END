import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import {
  limparEspacos,
  mascaraHorario,
  mascaraTelefone,
  somenteDigitos,
  traduzirErro,
  validarEndereco,
  validarHorario,
  validarNome,
  validarNomeFantasia,
  validarOrdemHorarios,
  validarTelefone,
} from '../../../utils/validacoes';
import { styles } from './styles';

// Campo reutilizável: rótulo + input + mensagem de erro
function Campo({ rotulo, valor, aoMudar, erro, somenteLeitura, ...resto }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.campo, erro && styles.campoErro, somenteLeitura && styles.campoBloqueado]}
        value={valor}
        onChangeText={aoMudar}
        editable={!somenteLeitura}
        placeholderTextColor="#A0A4A8"
        {...resto}
      />
      {!!erro && <Text style={styles.textoErro}>{erro}</Text>}
    </View>
  );
}

export default function EditarPerfil({ navigation }) {
  const { user, atualizarUsuario } = useAuth();
  const ehComerciante = user?.perfil === 'COMERCIANTE';

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'ok' | 'erro', texto }

  // Dados pessoais
  const [nome, setNome] = useState(user?.nome || '');
  const [telefone, setTelefone] = useState('');
  const email = user?.email || '';

  // Dados do mercado (só comerciante)
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [abertura, setAbertura] = useState('');
  const [fechamento, setFechamento] = useState('');
  const [cnpj, setCnpj] = useState('');

  // Senha (opcional)
  const [trocarSenha, setTrocarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [erros, setErros] = useState({});

  useEffect(() => {
    async function carregar() {
      // 1) Dados do usuário
      try {
        const res = await api.get('/api/usuarios/me');
        if (res.data?.nome) setNome(res.data.nome);
        if (res.data?.telefone) setTelefone(mascaraTelefone(res.data.telefone));
      } catch (e) {
        // Fallback: mantém dados do AuthContext
      }

      // 2) Dados do mercado (comerciante)
      if (ehComerciante && (user?.idMercadinho || user?.mercadinhoId)) {
        const idM = user.idMercadinho || user.mercadinhoId;
        try {
          let meu = null;
          try {
            const res = await api.get(`/api/mercadinhos/${idM}`);
            meu = res.data;
          } catch (e) {
            const res = await api.get('/api/mercadinhos');
            const lista = Array.isArray(res.data) ? res.data : res.data?.content || [];
            meu = lista.find((m) => Number(m.idMercadinho || m.id) === Number(idM));
          }

          if (meu) {
            setNomeFantasia(meu.nomeFantasia || '');
            setEndereco(meu.endereco || '');
            setCep(meu.cep || '');
            setLatitude(meu.latitude != null ? String(meu.latitude) : '');
            setLongitude(meu.longitude != null ? String(meu.longitude) : '');
            setAbertura(String(meu.horarioAbertura || '').slice(0, 5));
            setFechamento(String(meu.horarioFechamento || '').slice(0, 5));
            setCnpj(meu.cnpj || '');
          }
        } catch (e) {
          setAviso({ tipo: 'erro', texto: 'Não foi possível carregar os dados do mercado.' });
        }
      }
      setCarregando(false);
    }
    carregar();
  }, [ehComerciante, user]);

  function validar() {
    const e = {};
    const eNome = validarNome(nome);
    if (eNome) e.nome = eNome;

    if (telefone) {
      const eTel = validarTelefone(telefone);
      if (eTel) e.telefone = eTel;
    }

    if (ehComerciante) {
      const eNf = validarNomeFantasia(nomeFantasia);
      if (eNf) e.nomeFantasia = eNf;

      const eEnd = validarEndereco(endereco);
      if (eEnd) e.endereco = eEnd;

      const eAb = validarHorario(abertura, 'horário de abertura');
      if (eAb) e.abertura = eAb;

      const eFe = validarHorario(fechamento, 'horário de fechamento');
      if (eFe) e.fechamento = eFe;

      if (!eAb && !eFe) {
        const eOrd = validarOrdemHorarios(abertura, fechamento);
        if (eOrd) e.fechamento = eOrd;
      }
    }

    if (trocarSenha) {
      if (!senhaAtual) e.senhaAtual = 'Informe a senha atual.';
      if (novaSenha.length < 8 || novaSenha.length > 72)
        e.novaSenha = 'A nova senha deve ter de 8 a 72 caracteres.';
      else if (!/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha))
        e.novaSenha = 'Use letras e números.';
    }

    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function tentar(chamada) {
    try {
      await chamada();
      return 'ok';
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) return 'indisponivel';
      throw error;
    }
  }

  async function salvar() {
    setAviso(null);
    if (!validar()) return;

    setSalvando(true);
    try {
      const resultados = [];

      // Atualiza usuário
      resultados.push(
        await tentar(() =>
          api.put('/api/usuarios/me', {
            nome: limparEspacos(nome),
            telefone: somenteDigitos(telefone) || undefined,
          })
        )
      );

      // Atualiza mercadinho
      const idM = user?.idMercadinho || user?.mercadinhoId;
      if (ehComerciante && idM) {
        resultados.push(
          await tentar(() =>
            api.put(`/api/mercadinhos/${idM}`, {
              nomeFantasia: limparEspacos(nomeFantasia),
              endereco: limparEspacos(endereco),
              cep: limparEspacos(cep) || undefined,
              horarioAbertura: abertura ? `${abertura}:00` : undefined,
              horarioFechamento: fechamento ? `${fechamento}:00` : undefined,
              latitude: latitude ? parseFloat(latitude.replace(',', '.')) : null,
              longitude: longitude ? parseFloat(longitude.replace(',', '.')) : null,
            })
          )
        );
      }

      // Alteração de senha
      if (trocarSenha) {
        resultados.push(
          await tentar(() => api.put('/api/usuarios/me/senha', { senhaAtual, novaSenha, senha: novaSenha }))
        );
      }

      if (resultados.includes('indisponivel')) {
        setAviso({
          tipo: 'erro',
          texto: 'Esta função ainda não está disponível no servidor. Avise a equipe do back-end.',
        });
        return;
      }

      await atualizarUsuario({ nome: limparEspacos(nome) });
      setSenhaAtual('');
      setNovaSenha('');
      setTrocarSenha(false);
      setAviso({ tipo: 'ok', texto: 'Dados atualizados com sucesso!' });
    } catch (error) {
      const t = traduzirErro(error);
      setErros((antigos) => ({ ...antigos, ...t.campos }));
      setAviso({ tipo: 'erro', texto: t.mensagem });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={22} color={cores.textoTitulo} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Editar perfil</Text>
            <Text style={styles.subtitulo}>
              {ehComerciante ? 'Seus dados e os do mercado' : 'Mantenha seus dados em dia'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            {!!aviso && (
              <View style={[styles.aviso, aviso.tipo === 'ok' && styles.avisoOk]}>
                <Ionicons
                  name={aviso.tipo === 'ok' ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={aviso.tipo === 'ok' ? cores.sucesso : cores.primaria}
                />
                <Text style={styles.avisoTexto}>{aviso.texto}</Text>
              </View>
            )}

            <Text style={styles.secao}>Dados pessoais</Text>
            <View style={styles.cartao}>
              <Campo
                rotulo="Nome completo"
                valor={nome}
                aoMudar={setNome}
                erro={erros.nome}
                autoCapitalize="words"
              />
              <Campo
                rotulo="Telefone"
                valor={telefone}
                aoMudar={(v) => setTelefone(mascaraTelefone(v))}
                erro={erros.telefone}
                keyboardType="phone-pad"
                placeholder="(71) 99999-9999"
              />
              <Campo rotulo="E-mail (não pode ser alterado)" valor={email} somenteLeitura />
            </View>

            {ehComerciante && (
              <>
                <Text style={styles.secao}>Dados do mercado</Text>
                <View style={styles.cartao}>
                  <Campo
                    rotulo="Nome do mercadinho"
                    valor={nomeFantasia}
                    aoMudar={setNomeFantasia}
                    erro={erros.nomeFantasia}
                  />
                  <Campo
                    rotulo="Endereço"
                    valor={endereco}
                    aoMudar={setEndereco}
                    erro={erros.endereco}
                    placeholder="Rua, número e bairro"
                  />
                  <Campo
                    rotulo="CEP"
                    valor={cep}
                    aoMudar={setCep}
                    keyboardType="numeric"
                    placeholder="40000-000"
                  />

                  <View style={styles.linha}>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Latitude"
                        valor={latitude}
                        aoMudar={setLatitude}
                        keyboardType="numeric"
                        placeholder="-12.9714"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Longitude"
                        valor={longitude}
                        aoMudar={setLongitude}
                        keyboardType="numeric"
                        placeholder="-38.5014"
                      />
                    </View>
                  </View>

                  <View style={styles.linha}>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Abre às"
                        valor={abertura}
                        aoMudar={(v) => setAbertura(mascaraHorario(v))}
                        erro={erros.abertura}
                        keyboardType="number-pad"
                        placeholder="08:00"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Campo
                        rotulo="Fecha às"
                        valor={fechamento}
                        aoMudar={(v) => setFechamento(mascaraHorario(v))}
                        erro={erros.fechamento}
                        keyboardType="number-pad"
                        placeholder="20:00"
                      />
                    </View>
                  </View>
                  {!!cnpj && (
                    <Campo rotulo="CNPJ (não pode ser alterado)" valor={cnpj} somenteLeitura />
                  )}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.linkSenha} onPress={() => setTrocarSenha(!trocarSenha)}>
              <Ionicons name="lock-closed-outline" size={18} color={cores.primaria} />
              <Text style={styles.linkSenhaTexto}>
                {trocarSenha ? 'Cancelar troca de senha' : 'Alterar senha'}
              </Text>
            </TouchableOpacity>

            {trocarSenha && (
              <View style={styles.cartao}>
                <Campo
                  rotulo="Senha atual"
                  valor={senhaAtual}
                  aoMudar={setSenhaAtual}
                  erro={erros.senhaAtual}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Campo
                  rotulo="Nova senha"
                  valor={novaSenha}
                  aoMudar={setNovaSenha}
                  erro={erros.novaSenha}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
              onPress={salvar}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
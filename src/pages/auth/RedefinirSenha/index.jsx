import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/api";
import { cores } from "../../../theme";
import {
  somenteDigitos,
  traduzirErro,
  validarSenha,
} from "../../../utils/validacoes";
import { styles } from "./styles";

// Espera entre dois pedidos de código (o back também limita a 60 s)
const ESPERA_REENVIO_SEGUNDOS = 60;

// Segundo passo da recuperação de senha. Serve para cliente e comerciante:
// a conta é identificada pelo e-mail. Recebe pela navegação: { email }
export default function RedefinirSenha({ navigation, route }) {
  const email = route?.params?.email || "";

  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erros, setErros] = useState({});
  const [loadingReq, setLoadingReq] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  // O código acabou de ser enviado na tela anterior: já começa com a contagem
  const [espera, setEspera] = useState(ESPERA_REENVIO_SEGUNDOS);

  const { exibirAlerta } = useToast();

  useEffect(() => {
    if (espera <= 0) return undefined;
    const relogio = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(relogio);
  }, [espera]);

  function validar() {
    const novos = {
      codigo: codigo.length === 6 ? "" : "Digite os 6 números do código.",
      novaSenha: validarSenha(novaSenha),
      confirmarSenha:
        novaSenha === confirmarSenha ? "" : "As senhas não coincidem.",
    };
    setErros(novos);
    return !(novos.codigo || novos.novaSenha || novos.confirmarSenha);
  }

  async function handleRedefinir() {
    if (!email) {
      exibirAlerta("Informe o e-mail", "Volte e digite seu e-mail.", "aviso");
      navigation.navigate("RecuperarSenha");
      return;
    }
    if (!validar()) {
      exibirAlerta(
        "Confira os dados",
        "Preencha o código e a nova senha corretamente.",
        "aviso",
      );
      return;
    }

    setLoadingReq(true);
    try {
      await api.post("/api/auth/redefinir-senha", {
        email,
        codigo,
        novaSenha,
        confirmarSenha,
      });
      exibirAlerta(
        "Senha alterada",
        "Pronto! Entre com a sua nova senha.",
      );
      navigation.navigate("Login");
    } catch (error) {
      const erro = traduzirErro(error);
      if (error.response?.status === 400 && Object.keys(erro.campos).length) {
        setErros({
          codigo: erro.campos.codigo || "",
          novaSenha: erro.campos.novaSenha || "",
          confirmarSenha: "",
        });
        exibirAlerta(erro.titulo, erro.mensagem, "aviso");
      } else {
        exibirAlerta(erro.titulo, erro.mensagem);
      }
    } finally {
      setLoadingReq(false);
    }
  }

  async function reenviarCodigo() {
    if (!email || reenviando || espera > 0) return;
    setReenviando(true);
    try {
      await api.post("/api/auth/recuperar-senha", { email });
      exibirAlerta(
        "Código enviado",
        "Se o e-mail estiver cadastrado, enviamos um novo código. Confira também o spam.",
      );
      setEspera(ESPERA_REENVIO_SEGUNDOS);
    } catch (error) {
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setReenviando(false);
    }
  }

  const reenvioBloqueado = reenviando || espera > 0;

  return (
    <LinearGradient
      colors={[cores.degradeTopo, cores.degradeBase]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../../../assets/images/logo-na-esquina.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Na Esquina"
          />

          <View style={styles.cartao}>
            <Text style={styles.titulo}>Nova senha</Text>
            <Text style={styles.subtitulo}>
              Digite o código de 6 números que enviamos para:
            </Text>
            <Text style={styles.emailDestaque}>{email}</Text>

            <Text style={styles.rotulo}>Código</Text>
            <TextInput
              style={[
                styles.campo,
                styles.campoCodigo,
                erros.codigo ? styles.campoErro : null,
              ]}
              placeholder="000000"
              placeholderTextColor={cores.icone}
              keyboardType="number-pad"
              maxLength={6}
              value={codigo}
              onChangeText={(t) => {
                setCodigo(somenteDigitos(t));
                if (erros.codigo) setErros({ ...erros, codigo: "" });
              }}
            />
            {erros.codigo ? (
              <Text style={styles.textoErro}>{erros.codigo}</Text>
            ) : null}

            <Text style={styles.rotulo}>Nova senha</Text>
            <View
              style={[
                styles.campoSenha,
                erros.novaSenha ? styles.campoErro : null,
              ]}
            >
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Mínimo 8 caracteres, com letra e número"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                maxLength={72}
                value={novaSenha}
                onChangeText={(t) => {
                  setNovaSenha(t);
                  if (erros.novaSenha) setErros({ ...erros, novaSenha: "" });
                }}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Ionicons
                  name={mostrarSenha ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>
            {erros.novaSenha ? (
              <Text style={styles.textoErro}>{erros.novaSenha}</Text>
            ) : null}

            <Text style={styles.rotulo}>Confirmar nova senha</Text>
            <View
              style={[
                styles.campoSenha,
                erros.confirmarSenha ? styles.campoErro : null,
              ]}
            >
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Repita a nova senha"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarConfirmar}
                autoCapitalize="none"
                maxLength={72}
                value={confirmarSenha}
                onChangeText={(t) => {
                  setConfirmarSenha(t);
                  if (erros.confirmarSenha)
                    setErros({ ...erros, confirmarSenha: "" });
                }}
                onSubmitEditing={handleRedefinir}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Ionicons
                  name={mostrarConfirmar ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>
            {erros.confirmarSenha ? (
              <Text style={styles.textoErro}>{erros.confirmarSenha}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.botao, loadingReq && styles.botaoDesativado]}
              onPress={handleRedefinir}
              disabled={loadingReq}
              activeOpacity={0.85}
            >
              {loadingReq ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.botaoTexto}>Salvar nova senha</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoSecundario,
                reenvioBloqueado && styles.botaoDesativado,
              ]}
              onPress={reenviarCodigo}
              disabled={reenvioBloqueado}
              activeOpacity={0.85}
            >
              {reenviando ? (
                <ActivityIndicator color={cores.primaria} />
              ) : (
                <Text style={styles.botaoSecundarioTexto}>
                  {espera > 0
                    ? `Reenviar código (${espera}s)`
                    : "Reenviar código"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.linkVoltar}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={cores.textoLogin}
              />
              <Text style={styles.linkVoltarTexto}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

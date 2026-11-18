import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../../context/ToastContext";
import api from "../../../services/api";
import { cores } from "../../../theme";
import { traduzirErro } from "../../../utils/validacoes";
import { styles } from "./styles";

// Espera entre dois envios (o back também limita a 60 s)
const ESPERA_REENVIO_SEGUNDOS = 60;

// Tela mostrada depois do cadastro (ou quando o login é recusado por e-mail não confirmado).
// Recebe pela navegação: { email, posicaoAproximada?, veioDoLogin? }
export default function VerifiqueEmail({ navigation, route }) {
  const email = route?.params?.email || "";
  const posicaoAproximada = route?.params?.posicaoAproximada === true;
  const veioDoLogin = route?.params?.veioDoLogin === true;

  const { exibirAlerta } = useToast();
  const [enviando, setEnviando] = useState(false);
  // Logo após o cadastro o e-mail acabou de sair: já começa com a contagem. Vindo do login, pode reenviar na hora.
  const [espera, setEspera] = useState(veioDoLogin ? 0 : ESPERA_REENVIO_SEGUNDOS);

  // Contagem regressiva do botão "Reenviar"
  useEffect(() => {
    if (espera <= 0) return undefined;
    const relogio = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(relogio);
  }, [espera]);

  async function reenviar() {
    if (!email || enviando || espera > 0) return;
    setEnviando(true);
    try {
      await api.post("/api/auth/reenviar-verificacao", { email });
      exibirAlerta(
        "E-mail enviado",
        "Se a conta ainda estiver aguardando confirmação, enviamos um novo link. Confira também o spam.",
      );
      setEspera(ESPERA_REENVIO_SEGUNDOS);
    } catch (error) {
      const erro = traduzirErro(error);
      exibirAlerta(erro.titulo, erro.mensagem);
    } finally {
      setEnviando(false);
    }
  }

  const botaoBloqueado = enviando || espera > 0;

  return (
    <LinearGradient
      colors={[cores.degradeTopo, cores.degradeBase]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../../../assets/images/logo-na-esquina.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Na Esquina"
        />

        <View style={styles.cartao}>
          <View style={styles.iconeArea}>
            <Ionicons name="mail-outline" size={36} color={cores.primaria} />
          </View>

          <Text style={styles.titulo}>
            {veioDoLogin ? "Confirme seu e-mail" : "Verifique seu e-mail"}
          </Text>
          <Text style={styles.subtitulo}>
            {veioDoLogin
              ? "Sua conta ainda não foi ativada. Abra o link que enviamos para:"
              : "Enviamos um link de confirmação para:"}
          </Text>
          <Text style={styles.emailDestaque}>{email}</Text>
          <Text style={styles.dica}>
            Clique no link do e-mail para ativar a conta e depois faça login. O
            link vale por 24 horas. Não achou? Olhe a caixa de spam. Contas não
            confirmadas em 48 horas são removidas.
          </Text>

          {posicaoAproximada ? (
            <Text style={styles.aviso}>
              Não achamos o número exato no mapa, então a posição do
              mercadinho é aproximada. Você pode ajustar depois no perfil.
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.botao}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <Text style={styles.botaoTexto}>Já confirmei, ir para o login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoSecundario, botaoBloqueado && styles.botaoDesativado]}
            onPress={reenviar}
            disabled={botaoBloqueado}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator color={cores.primaria} />
            ) : (
              <Text style={styles.botaoSecundarioTexto}>
                {espera > 0 ? `Reenviar e-mail (${espera}s)` : "Reenviar e-mail"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

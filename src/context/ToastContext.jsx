import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { cores } from "../theme";

// ---------------------------------------------------------------------------
// Toast centralizado do Na Esquina.
//
// Substitui os alert() / Alert.alert() de AVISO (erro, sucesso, validação).
// Perguntas com botões (ex.: "Deseja sair?") usam o confirmar() deste mesmo arquivo.
//
// Como usar em qualquer tela:
//   const { exibirAlerta } = useToast();
//   exibirAlerta('Erro', 'Não foi possível salvar.');            // tipo descoberto pelo título
//   exibirAlerta('Atenção', 'Preencha o nome.', 'aviso');         // ou informe o tipo
//
// Pergunta Sim/Não (quadro no centro da tela):
//   const { confirmar } = useToast();
//   const sim = await confirmar({
//     titulo: 'Sair da conta',
//     mensagem: 'Deseja realmente sair da sua conta?',
//     textoConfirmar: 'Sim, sair',
//     tipo: 'perigo',            // 'perigo' (vermelho) | 'padrao' | 'sucesso' (verde)
//   });
//   if (sim) signOut();
// ---------------------------------------------------------------------------

const ToastContext = createContext(null);

// Cada tipo tem uma cor e um ícone
const TIPOS = {
  sucesso: { cor: cores.sucesso, icone: "checkmark-circle" },
  erro: { cor: cores.erro, icone: "close-circle" },
  aviso: { cor: cores.laranjaDistancia, icone: "alert-circle" },
  info: { cor: cores.textoLogin, icone: "information-circle" },
};

// Tipos do quadro de confirmação: cor da faixa/ícone e cor do botão "confirmar"
const TIPOS_CONFIRMACAO = {
  perigo: { cor: cores.erro, icone: "warning", botao: cores.erro },
  padrao: {
    cor: cores.textoLogin,
    icone: "help-circle",
    botao: cores.primaria,
  },
  sucesso: {
    cor: cores.sucesso,
    icone: "checkmark-circle",
    botao: cores.sucesso,
  },
};

// Descobre o tipo pelo título, para as telas antigas não precisarem informar nada.
// A ordem importa: "Conta criada, mas o mercadinho não foi salvo" é aviso, não sucesso.
export function descobrirTipo(titulo) {
  const t = String(titulo || "").toLowerCase();
  if (/(aten[cç][aã]o|confira|corrija|\bmas\b)/.test(t)) return "aviso";
  if (
    /(erro|falha|inv[aá]lid|negado|sem conex|indispon|n[aã]o encontrad|permiss|j[aá] cadastrad|demorou|servidor)/.test(
      t,
    )
  )
    return "erro";
  if (
    /(sucesso|realizado|atualizad|retirad|criad|salv|cadastrad|conclu[ií]d)/.test(
      t,
    )
  )
    return "sucesso";
  return "info";
}

// Quanto tempo o toast fica na tela (erros e textos longos ficam mais)
function calcularDuracao(tipo, mensagem) {
  const base = tipo === "sucesso" ? 2400 : 3800;
  const extra = Math.min(String(mensagem || "").length * 25, 3000);
  return base + extra;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, tipo, titulo, mensagem }
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.9)).current;
  const timer = useRef(null);
  const contador = useRef(0);

  // No celular a animação roda no "driver nativo"; na web isso não existe
  const usarNativo = Platform.OS !== "web";

  const esconder = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 160,
        useNativeDriver: usarNativo,
      }),
      Animated.timing(escala, {
        toValue: 0.9,
        duration: 160,
        useNativeDriver: usarNativo,
      }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacidade, escala, usarNativo]);

  const mostrar = useCallback(
    ({ tipo, titulo, mensagem, duracao }) => {
      const tipoFinal = tipo || descobrirTipo(titulo);
      if (timer.current) clearTimeout(timer.current);

      contador.current += 1;
      setToast({ id: contador.current, tipo: tipoFinal, titulo, mensagem });

      opacidade.setValue(0);
      escala.setValue(0.9);
      Animated.parallel([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 180,
          useNativeDriver: usarNativo,
        }),
        Animated.spring(escala, {
          toValue: 1,
          friction: 7,
          useNativeDriver: usarNativo,
        }),
      ]).start();

      timer.current = setTimeout(
        esconder,
        duracao || calcularDuracao(tipoFinal, mensagem),
      );
    },
    [opacidade, escala, esconder, usarNativo],
  );

  // ----------------------------- quadro de confirmação -----------------------------
  const [dialogo, setDialogo] = useState(null); // opções da pergunta aberta
  const opacidadeDlg = useRef(new Animated.Value(0)).current;
  const escalaDlg = useRef(new Animated.Value(0.92)).current;
  const resolverDlg = useRef(null); // função que entrega a resposta (true/false) a quem perguntou

  // Fecha o quadro e entrega a resposta. Só responde UMA vez (evita toque duplo).
  const responder = useCallback(
    (resposta) => {
      const resolver = resolverDlg.current;
      if (!resolver) return;
      resolverDlg.current = null;
      resolver(resposta);

      Animated.parallel([
        Animated.timing(opacidadeDlg, {
          toValue: 0,
          duration: 140,
          useNativeDriver: usarNativo,
        }),
        Animated.timing(escalaDlg, {
          toValue: 0.92,
          duration: 140,
          useNativeDriver: usarNativo,
        }),
      ]).start(() => setDialogo(null));
    },
    [opacidadeDlg, escalaDlg, usarNativo],
  );

  // confirmar({...}) devolve uma Promise: true = "Sim", false = cancelou / tocou fora / voltou.
  // Também aceita onConfirmar / onCancelar, se preferir callbacks.
  const confirmar = useCallback(
    (opcoes) =>
      new Promise((resolve) => {
        // Se já havia uma pergunta aberta, ela é respondida como "não"
        if (resolverDlg.current) resolverDlg.current(false);

        resolverDlg.current = (resposta) => {
          if (resposta) opcoes.onConfirmar?.();
          else opcoes.onCancelar?.();
          resolve(resposta);
        };

        setDialogo({
          titulo: opcoes.titulo,
          mensagem: opcoes.mensagem,
          textoConfirmar: opcoes.textoConfirmar || "Confirmar",
          textoCancelar: opcoes.textoCancelar || "Cancelar",
          tipo: opcoes.tipo || "padrao",
        });

        opacidadeDlg.setValue(0);
        escalaDlg.setValue(0.92);
        Animated.parallel([
          Animated.timing(opacidadeDlg, {
            toValue: 1,
            duration: 160,
            useNativeDriver: usarNativo,
          }),
          Animated.spring(escalaDlg, {
            toValue: 1,
            friction: 8,
            useNativeDriver: usarNativo,
          }),
        ]).start();
      }),
    [opacidadeDlg, escalaDlg, usarNativo],
  );

  // Enquanto o quadro está aberto: botão "voltar" do Android e tecla Esc (web) = cancelar
  useEffect(() => {
    if (!dialogo) return undefined;

    const aoVoltar = () => {
      responder(false);
      return true; // true = "eu tratei", o app não volta de tela
    };
    // BackHandler só existe no celular; na web ele avisa no console, então nem registramos
    const assinatura =
      Platform.OS === "web"
        ? null
        : BackHandler.addEventListener("hardwareBackPress", aoVoltar);

    let aoTeclar;
    if (Platform.OS === "web" && typeof document !== "undefined") {
      aoTeclar = (e) => {
        if (e.key === "Escape") responder(false);
      };
      document.addEventListener("keydown", aoTeclar);
    }

    return () => {
      assinatura?.remove?.();
      if (aoTeclar) document.removeEventListener("keydown", aoTeclar);
    };
  }, [dialogo, responder]);

  // Limpa o temporizador se o app for fechado
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  // Mesmo formato dos antigos exibirAlerta(titulo, mensagem): só trocar a origem da função
  const exibirAlerta = useCallback(
    (titulo, mensagem, tipo) => mostrar({ titulo, mensagem, tipo }),
    [mostrar],
  );

  const valor = useMemo(
    () => ({ mostrar, exibirAlerta, esconder, confirmar }),
    [mostrar, exibirAlerta, esconder, confirmar],
  );

  const estilo = toast ? TIPOS[toast.tipo] || TIPOS.info : TIPOS.info;
  const estiloDlg = dialogo
    ? TIPOS_CONFIRMACAO[dialogo.tipo] || TIPOS_CONFIRMACAO.padrao
    : TIPOS_CONFIRMACAO.padrao;

  return (
    <ToastContext.Provider value={valor}>
      <View style={styles.raiz}>
        {children}

        {toast && (
          // box-none: a área vazia NÃO bloqueia os toques; só o cartão do toast reage
          <View style={styles.camada} pointerEvents="box-none">
            <Animated.View
              style={{ opacity: opacidade, transform: [{ scale: escala }] }}
            >
              <Pressable
                onPress={esconder}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[styles.cartao, { borderTopColor: estilo.cor }]}
              >
                <Ionicons name={estilo.icone} size={34} color={estilo.cor} />
                {!!toast.titulo && (
                  <Text style={styles.titulo}>{toast.titulo}</Text>
                )}
                {!!toast.mensagem && (
                  <Text style={styles.mensagem}>{toast.mensagem}</Text>
                )}
              </Pressable>
            </Animated.View>
          </View>
        )}

        {dialogo && (
          // Fica POR CIMA do toast. O fundo escuro bloqueia os toques na tela de trás.
          <Animated.View style={[styles.fundoDlg, { opacity: opacidadeDlg }]}>
            {/* Tocar fora do cartão = cancelar */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => responder(false)}
              accessibilityLabel="Fechar"
            />
            <Animated.View
              accessibilityRole="alert"
              style={[
                styles.cartaoDlg,
                {
                  borderTopColor: estiloDlg.cor,
                  transform: [{ scale: escalaDlg }],
                },
              ]}
            >
              <Ionicons
                name={estiloDlg.icone}
                size={38}
                color={estiloDlg.cor}
              />
              {!!dialogo.titulo && (
                <Text style={styles.titulo}>{dialogo.titulo}</Text>
              )}
              {!!dialogo.mensagem && (
                <Text style={styles.mensagem}>{dialogo.mensagem}</Text>
              )}

              <View style={styles.botoesDlg}>
                <Pressable
                  onPress={() => responder(false)}
                  style={({ pressed }) => [
                    styles.botaoDlg,
                    styles.botaoCancelar,
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <Text style={styles.textoCancelar}>
                    {dialogo.textoCancelar}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => responder(true)}
                  style={({ pressed }) => [
                    styles.botaoDlg,
                    { backgroundColor: estiloDlg.botao },
                    pressed && styles.botaoPressionado,
                  ]}
                >
                  <Text style={styles.textoConfirmar}>
                    {dialogo.textoConfirmar}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error(
      "useToast precisa estar dentro do <ToastProvider> (veja o App.jsx).",
    );
  }
  return contexto;
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  camada: {
    ...StyleSheet.absoluteFillObject, // cobre a tela inteira...
    alignItems: "center", // centraliza o cartão na horizontal
    justifyContent: "flex-start", // encosta o cartão no TOPO
    paddingTop: 48, // espaço para a barra de status / notch do celular
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  cartao: {
    width: "100%",
    maxWidth: 340,
    minWidth: 240,
    alignItems: "center",
    gap: 6,
    backgroundColor: cores.fundoCartaoLogin,
    borderRadius: 16,
    borderTopWidth: 5, // a faixa colorida do topo indica o tipo
    paddingVertical: 20,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: cores.textoLogin,
    textAlign: "center",
    marginTop: 2,
  },
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    textAlign: "center",
  },

  // ----- quadro de confirmação -----
  fundoDlg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35, 36, 71, 0.5)", // azul-escuro da marca com transparência
    alignItems: "center",
    justifyContent: "center", // confirmações ficam no CENTRO
    paddingHorizontal: 24,
    zIndex: 10000, // acima do toast (9999)
    elevation: 10000,
  },
  cartaoDlg: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    gap: 6,
    backgroundColor: cores.fundoCartaoLogin, // mesmo cartão do toast
    borderRadius: 16,
    borderTopWidth: 5,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  botoesDlg: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  botaoDlg: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoCancelar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: cores.icone,
  },
  botaoPressionado: { opacity: 0.8 },
  textoCancelar: { fontSize: 15, fontWeight: "700", color: cores.textoLogin },
  textoConfirmar: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});

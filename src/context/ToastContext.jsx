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
// Perguntas com botões (ex.: "Deseja sair?") continuam usando confirm/Alert.
//
// Como usar em qualquer tela:
//   const { exibirAlerta } = useToast();
//   exibirAlerta('Erro', 'Não foi possível salvar.');            // tipo descoberto pelo título
//   exibirAlerta('Atenção', 'Preencha o nome.', 'aviso');         // ou informe o tipo
// ---------------------------------------------------------------------------

const ToastContext = createContext(null);

// Cada tipo tem uma cor e um ícone
const TIPOS = {
  sucesso: { cor: cores.sucesso, icone: "checkmark-circle" },
  erro: { cor: cores.erro, icone: "close-circle" },
  aviso: { cor: cores.laranjaDistancia, icone: "alert-circle" },
  info: { cor: cores.textoLogin, icone: "information-circle" },
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

  // Limpa o temporizador se o app for fechado
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  // Mesmo formato dos antigos exibirAlerta(titulo, mensagem): só trocar a origem da função
  const exibirAlerta = useCallback(
    (titulo, mensagem, tipo) => mostrar({ titulo, mensagem, tipo }),
    [mostrar],
  );

  const valor = useMemo(
    () => ({ mostrar, exibirAlerta, esconder }),
    [mostrar, exibirAlerta, esconder],
  );

  const estilo = toast ? TIPOS[toast.tipo] || TIPOS.info : TIPOS.info;

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
});
